import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, desc, eq, inArray, isNull, lt } from "drizzle-orm";
import type { Express, NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import {
  partnerAdminInvites,
  partnerAssets,
  partnerInquiries,
  partnerNotifications,
  type PartnerAsset,
  type PartnerInquiry,
  users,
} from "../drizzle/schema";
import {
  partnerSubmissionSchema,
  type PartnerSubmission,
} from "../shared/partner";
import { getDb } from "./db";
import {
  buildNotificationRecord,
  deliverNotification,
  notificationWorkerAuthorized,
  processDueNotifications,
  readNotificationStatus,
  tryDeliverNotification,
} from "./partnerNotifications";
import {
  createDirectUpload,
  createPrivateDownloadUrl,
  deletePrivateObject,
  inspectPrivateObject,
  objectStorageKey,
  objectStoragePointer,
  privateObjectStorageEnabled,
} from "./privateObjectStorage";
import { sdk } from "./_core/sdk";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 10;
const TEMP_UPLOAD_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const ASSET_ID_PATTERN = /^[A-Za-z0-9_-]{43,96}$/;
const UPLOAD_CAPABILITY_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const LOGO_MIME_TYPES = new Set(["image/png", "image/jpeg"]);

export type PartnerAssetMetadata = {
  id: string;
  name: string;
  type: string;
  size: number;
};

type DetectedFile = {
  type: string;
  bytes: Buffer;
};

type RateLimitBucket = { count: number; resetAt: number };
const rateLimitBuckets = new Map<string, RateLimitBucket>();

function noStore(res: Response): void {
  res.set({
    "Cache-Control": "private, no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
}

export function partnerNoStoreMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  noStore(res);
  next();
}

/** Deliberately ignores X-Forwarded-For; this process does not trust an arbitrary proxy chain. */
export function directClientIp(req: Request): string {
  return req.socket.remoteAddress || "unknown";
}

function rateLimit(namespace: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${namespace}:${directClientIp(req)}`;
    const existing = rateLimitBuckets.get(key);
    const bucket =
      !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : existing;
    bucket.count += 1;
    rateLimitBuckets.set(key, bucket);

    // Bounded opportunistic cleanup avoids an unbounded map for an internet-facing route.
    if (rateLimitBuckets.size > 10_000) {
      for (const [bucketKey, value] of rateLimitBuckets) {
        if (value.resetAt <= now) rateLimitBuckets.delete(bucketKey);
      }
    }

    res.set("RateLimit-Limit", String(maxRequests));
    res.set(
      "RateLimit-Remaining",
      String(Math.max(0, maxRequests - bucket.count))
    );
    res.set("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > maxRequests) {
      res.set(
        "Retry-After",
        String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)))
      );
      res
        .status(429)
        .json({ error: "Too many requests. Please try again shortly." });
      return;
    }
    next();
  };
}

function cleanFileName(value: string): string {
  const basename = value.replace(/\\/g, "/").split("/").pop() || "upload";
  const safe = basename
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/["\\]/g, "_")
    .trim()
    .slice(0, 255);
  return safe || "upload";
}

function decodeBase64(value: unknown): Buffer {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("File data must be a base64 string");
  }
  // A data URL is intentionally not accepted: callers must send only the encoded bytes.
  if (
    value.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(value) ||
    (value.includes("=") && !/={1,2}$/.test(value))
  ) {
    throw new Error("File data is not valid base64");
  }
  const bytes = Buffer.from(value, "base64");
  if (bytes.length === 0 || bytes.toString("base64") !== value) {
    throw new Error("File data is not valid base64");
  }
  return bytes;
}

function isDocx(bytes: Buffer): boolean {
  if (
    bytes.length < 4 ||
    bytes.subarray(0, 4).compare(Buffer.from("PK\x03\x04", "binary")) !== 0
  ) {
    return false;
  }
  // OOXML documents are ZIP containers. Both markers must be present; a generic ZIP is not accepted.
  return (
    bytes.includes(Buffer.from("[Content_Types].xml", "utf8")) &&
    bytes.includes(Buffer.from("word/", "utf8"))
  );
}

/** Detect from bytes rather than trusting the browser-provided MIME type or filename extension. */
export function detectFile(bytes: Buffer): string | null {
  if (
    bytes.length >= 8 &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 6 &&
    (bytes.subarray(0, 6).equals(Buffer.from("GIF87a")) ||
      bytes.subarray(0, 6).equals(Buffer.from("GIF89a")))
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).equals(Buffer.from("RIFF")) &&
    bytes.subarray(8, 12).equals(Buffer.from("WEBP"))
  ) {
    return "image/webp";
  }
  if (bytes.length >= 5 && bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    return "application/pdf";
  }
  if (
    bytes.length >= 8 &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
  ) {
    return "application/msword";
  }
  if (isDocx(bytes)) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return null;
}

const uploadSchema = z
  .object({
    name: z.string().min(1).max(512),
    type: z.string().min(1).max(128),
    data: z
      .string()
      .min(4)
      .max(Math.ceil(MAX_FILE_BYTES / 3) * 4 + 4),
  })
  .strict();

const directUploadSchema = z
  .object({
    name: z.string().min(1).max(512),
    type: z.string().min(1).max(128),
    size: z.number().int().positive().max(MAX_FILE_BYTES),
  })
  .strict();

const adminActivationSchema = z.object({ code: z.string() }).strict();

/** A canonical unpadded 32-byte base64url value, used as an opaque capability. */
function isUploadCapability(value: string): boolean {
  if (!UPLOAD_CAPABILITY_PATTERN.test(value)) return false;
  const bytes = Buffer.from(value, "base64url");
  return bytes.length === 32 && bytes.toString("base64url") === value;
}

/** Validates a file body and returns only canonical, server-derived metadata. */
export function validateUploadPayload(input: unknown): {
  name: string;
  detected: DetectedFile;
} {
  const payload = uploadSchema.parse(input);
  const bytes = decodeBase64(payload.data);
  if (bytes.length > MAX_FILE_BYTES) {
    throw new Error("Each file must be 5 MB or smaller");
  }
  const type = detectFile(bytes);
  if (!type || !MIME_TYPES.has(type)) {
    throw new Error("Unsupported file format");
  }
  const suppliedType =
    payload.type.toLowerCase() === "image/jpg"
      ? "image/jpeg"
      : payload.type.toLowerCase();
  if (suppliedType !== type) {
    throw new Error("File type does not match its contents");
  }
  return { name: cleanFileName(payload.name), detected: { type, bytes } };
}

function validateDirectUploadPayload(input: unknown) {
  const payload = directUploadSchema.parse(input);
  const type =
    payload.type.toLowerCase() === "image/jpg"
      ? "image/jpeg"
      : payload.type.toLowerCase();
  if (!MIME_TYPES.has(type)) throw new Error("Unsupported file format");
  return { name: cleanFileName(payload.name), type, size: payload.size };
}

async function validatePrivateObjectAsset(asset: PartnerAsset): Promise<void> {
  const key = objectStorageKey(asset.dataBase64);
  if (!key) return;
  const object = await inspectPrivateObject(key);
  if (object.size !== asset.size || object.type !== asset.type) {
    throw new Error("Uploaded file metadata does not match the selected file");
  }
  const detected = detectFile(object.prefix);
  if (!detected || detected !== asset.type || !MIME_TYPES.has(detected)) {
    throw new Error("File type does not match its contents");
  }
}

function publicAsset(
  asset: Pick<PartnerAsset, "id" | "name" | "type" | "size">
): PartnerAssetMetadata {
  return { id: asset.id, name: asset.name, type: asset.type, size: asset.size };
}

function issueMessage(error: ZodError): string {
  return error.issues[0]?.message || "Invalid request";
}

function jsonError(res: Response, status: number, message: string): void {
  res.status(status).json({ error: message });
}

async function getAdmin(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (user.role !== "admin") {
      jsonError(res, 403, "Administrator access is required");
      return null;
    }
    return user;
  } catch {
    jsonError(res, 401, "Authentication is required");
    return null;
  }
}

function safeJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function safeStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) &&
      parsed.every(item => typeof item === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function responseDate(value: Date): string {
  return value.toISOString();
}

function submissionResponse(
  inquiry: Pick<PartnerInquiry, "id" | "submittedAt">
) {
  return { id: inquiry.id, submittedAt: responseDate(inquiry.submittedAt) };
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      (("code" in error &&
        (error as { code?: unknown }).code === "ER_DUP_ENTRY") ||
        ("message" in error &&
          typeof (error as { message?: unknown }).message === "string" &&
          (error as { message: string }).message.includes("Duplicate entry")))
  );
}

async function findSubmissionByRequestId(requestId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const records = await db
    .select({
      id: partnerInquiries.id,
      submittedAt: partnerInquiries.submittedAt,
    })
    .from(partnerInquiries)
    .where(eq(partnerInquiries.requestId, requestId))
    .limit(1);
  return records[0] ?? null;
}

async function createInquiry(submission: PartnerSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const assetIds = submission.logoId
    ? [submission.logoId, ...submission.assetIds]
    : submission.assetIds;
  const inquiryId = randomUUID();

  return db.transaction(async tx => {
    // Locks an existing idempotency row (and MySQL's unique-index gap when absent).
    const existing = await tx
      .select({
        id: partnerInquiries.id,
        submittedAt: partnerInquiries.submittedAt,
      })
      .from(partnerInquiries)
      .where(eq(partnerInquiries.requestId, submission.requestId))
      .limit(1)
      .for("update");
    if (existing[0]) return existing[0];

    let assets: PartnerAsset[] = [];
    if (assetIds.length) {
      assets = await tx
        .select()
        .from(partnerAssets)
        .where(inArray(partnerAssets.id, assetIds))
        .for("update");
      if (
        assets.length !== assetIds.length ||
        assets.some(asset => asset.inquiryId !== null)
      ) {
        throw new Error("One or more uploaded files are unavailable");
      }
      if (
        assets.some(asset => asset.size > MAX_FILE_BYTES) ||
        assets.reduce((total, asset) => total + asset.size, 0) > MAX_TOTAL_BYTES
      ) {
        throw new Error("Attached files exceed the allowed total size");
      }
      for (const asset of assets) await validatePrivateObjectAsset(asset);
      if (submission.logoId) {
        const logo = assets.find(asset => asset.id === submission.logoId);
        if (!logo || !LOGO_MIME_TYPES.has(logo.type)) {
          throw new Error("A logo must be a PNG or JPEG image");
        }
      }
    }

    // MySQL's default timestamp precision is seconds; matching it keeps the
    // initial and idempotent-repeat responses byte-for-byte consistent.
    const submittedAt = new Date();
    submittedAt.setMilliseconds(0);
    await tx.insert(partnerInquiries).values({
      id: inquiryId,
      requestId: submission.requestId,
      company: submission.data.company,
      firstName: submission.data.firstName,
      lastName: submission.data.lastName,
      email: submission.data.email,
      partnerships: JSON.stringify(submission.data.partnerships),
      data: JSON.stringify(submission.data),
      submittedAt,
    });

    if (assetIds.length) {
      for (const assetId of assetIds) {
        await tx
          .update(partnerAssets)
          .set({
            inquiryId,
            role: assetId === submission.logoId ? "logo" : "asset",
          })
          .where(
            and(eq(partnerAssets.id, assetId), isNull(partnerAssets.inquiryId))
          );
      }
    }

    const notification = buildNotificationRecord({
      id: inquiryId,
      submittedAt,
      data: submission.data,
      assets: assets.map(asset => ({
        name: asset.name,
        type: asset.type,
        size: asset.size,
        role: asset.id === submission.logoId ? "logo" : "asset",
      })),
    });
    if (notification)
      await tx.insert(partnerNotifications).values(notification);

    return { id: inquiryId, submittedAt };
  });
}

function contentDisposition(name: string): string {
  const fallback = cleanFileName(name)
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "_");
  const utf8 = encodeURIComponent(cleanFileName(name)).replace(
    /[!'()*]/g,
    character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `attachment; filename="${fallback}"; filename*=UTF-8''${utf8}`;
}

export function registerPartnerRoutes(app: Express): void {
  // Public endpoints are rate limited by the direct socket address only.
  app.post(
    "/api/partner/upload-url",
    partnerNoStoreMiddleware,
    rateLimit("partner-direct-upload", 30, 10 * 60 * 1000),
    async (req, res) => {
      if (!privateObjectStorageEnabled()) {
        // Local/Manus deployments retain the original base64 database upload path.
        res.status(404).json({ error: "Direct upload is not configured" });
        return;
      }
      try {
        const payload = validateDirectUploadPayload(req.body);
        const db = await getDb();
        if (!db) {
          jsonError(res, 503, "Submission service is temporarily unavailable");
          return;
        }
        const directUpload = await createDirectUpload(payload.type);
        if (!directUpload) {
          jsonError(res, 503, "Direct upload is temporarily unavailable");
          return;
        }
        await db.insert(partnerAssets).values({
          id: directUpload.id,
          name: payload.name,
          type: payload.type,
          size: payload.size,
          dataBase64: objectStoragePointer(directUpload.key),
        });
        res.status(201).json({
          id: directUpload.id,
          name: payload.name,
          type: payload.type,
          size: payload.size,
          uploadUrl: directUpload.uploadUrl,
        });
      } catch (error) {
        if (error instanceof ZodError) {
          jsonError(res, 400, issueMessage(error));
          return;
        }
        if (
          error instanceof Error &&
          /file|format|type|5 MB/i.test(error.message)
        ) {
          jsonError(res, 400, error.message);
          return;
        }
        console.error("[Partner] Direct upload preparation failed", error);
        jsonError(res, 500, "Unable to prepare this file upload");
      }
    }
  );

  app.post(
    "/api/partner/upload",
    partnerNoStoreMiddleware,
    rateLimit("partner-upload", 30, 10 * 60 * 1000),
    async (req, res) => {
      try {
        const upload = validateUploadPayload(req.body);
        const db = await getDb();
        if (!db) {
          jsonError(res, 503, "Submission service is temporarily unavailable");
          return;
        }
        const id = randomBytes(32).toString("base64url");
        // This is intentionally lazy rather than scheduled. The predicate is part
        // of the DELETE statement so a concurrently claimed asset is never pruned.
        await db
          .delete(partnerAssets)
          .where(
            and(
              isNull(partnerAssets.inquiryId),
              lt(
                partnerAssets.createdAt,
                new Date(Date.now() - TEMP_UPLOAD_MAX_AGE_MS)
              )
            )
          );
        await db.insert(partnerAssets).values({
          id,
          name: upload.name,
          type: upload.detected.type,
          size: upload.detected.bytes.length,
          dataBase64: upload.detected.bytes.toString("base64"),
        });
        res.status(201).json({
          id,
          name: upload.name,
          type: upload.detected.type,
          size: upload.detected.bytes.length,
        });
      } catch (error) {
        if (error instanceof ZodError) {
          jsonError(res, 400, issueMessage(error));
          return;
        }
        if (
          error instanceof Error &&
          /base64|file|format|type|5 MB/i.test(error.message)
        ) {
          jsonError(res, 400, error.message);
          return;
        }
        console.error("[Partner] Upload failed", error);
        jsonError(res, 500, "Unable to save the uploaded file");
      }
    }
  );

  app.delete(
    "/api/partner/upload/:id",
    partnerNoStoreMiddleware,
    rateLimit("partner-upload-delete", 30, 10 * 60 * 1000),
    async (req, res) => {
      const id = req.params.id;
      // Invalid and absent capabilities are both a successful no-op; neither
      // response can disclose whether an upload ever existed.
      if (!isUploadCapability(id)) {
        res.status(204).end();
        return;
      }
      try {
        const db = await getDb();
        if (!db) {
          jsonError(res, 503, "Submission service is temporarily unavailable");
          return;
        }
        // Claimed assets are submitted files and are intentionally immutable here.
        const candidates = privateObjectStorageEnabled()
          ? await db
              .select({ dataBase64: partnerAssets.dataBase64 })
              .from(partnerAssets)
              .where(
                and(eq(partnerAssets.id, id), isNull(partnerAssets.inquiryId))
              )
              .limit(1)
          : [];
        await db
          .delete(partnerAssets)
          .where(
            and(eq(partnerAssets.id, id), isNull(partnerAssets.inquiryId))
          );
        const key = candidates[0] && objectStorageKey(candidates[0].dataBase64);
        if (key) await deletePrivateObject(key).catch(() => {});
        res.status(204).end();
      } catch (error) {
        console.error("[Partner] Upload removal failed", error);
        jsonError(res, 500, "Unable to remove the uploaded file");
      }
    }
  );

  app.post(
    "/api/partner/admin/activate",
    partnerNoStoreMiddleware,
    rateLimit("partner-admin-activate", 5, 10 * 60 * 1000),
    async (req, res) => {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        jsonError(res, 401, "Authentication is required");
        return;
      }
      if (user.isCron) {
        jsonError(
          res,
          403,
          "Administrator activation is not available for this account"
        );
        return;
      }

      let code: string;
      try {
        code = adminActivationSchema.parse(req.body).code;
      } catch (error) {
        if (error instanceof ZodError) {
          jsonError(res, 400, issueMessage(error));
          return;
        }
        jsonError(res, 400, "Invalid activation code");
        return;
      }
      if (!isUploadCapability(code)) {
        jsonError(res, 400, "Invalid activation code");
        return;
      }

      try {
        const db = await getDb();
        if (!db) {
          jsonError(res, 503, "Submission service is temporarily unavailable");
          return;
        }
        const tokenHash = createHash("sha256").update(code).digest("hex");
        const now = new Date();
        const activated = await db.transaction(async tx => {
          // The unique hash lookup plus row lock lets exactly one authenticated
          // user consume this invite, even when two attempts arrive together.
          const invites = await tx
            .select()
            .from(partnerAdminInvites)
            .where(eq(partnerAdminInvites.tokenHash, tokenHash))
            .limit(1)
            .for("update");
          const invite = invites[0];
          if (!invite || invite.usedAt !== null || invite.expiresAt <= now)
            return false;

          await tx
            .update(users)
            .set({ role: "admin" })
            .where(eq(users.id, user.id));
          await tx
            .update(partnerAdminInvites)
            .set({ usedAt: now })
            .where(
              and(
                eq(partnerAdminInvites.id, invite.id),
                isNull(partnerAdminInvites.usedAt)
              )
            );
          return true;
        });
        if (!activated) {
          jsonError(res, 403, "Invalid or expired activation code");
          return;
        }
        res.json({ success: true });
      } catch (error) {
        console.error("[Partner] Administrator activation failed", error);
        jsonError(res, 500, "Unable to activate administrator access");
      }
    }
  );

  app.post(
    "/api/partner/inquiries",
    partnerNoStoreMiddleware,
    rateLimit("partner-submit", 12, 10 * 60 * 1000),
    async (req, res) => {
      let requestId: string;
      try {
        requestId = z
          .object({ requestId: z.string().uuid() })
          .passthrough()
          .parse(req.body).requestId;
      } catch {
        jsonError(res, 400, "requestId must be a UUID");
        return;
      }

      try {
        // Idempotent repeats expose no saved form data, only this opaque id and time.
        const prior = await findSubmissionByRequestId(requestId);
        if (prior) {
          await tryDeliverNotification(prior.id);
          res.status(200).json(submissionResponse(prior));
          return;
        }

        const submission = partnerSubmissionSchema.parse(req.body);
        const created = await createInquiry(submission);
        await tryDeliverNotification(created.id);
        res.status(201).json(submissionResponse(created));
      } catch (error) {
        // A concurrent request can race immediately after the preliminary lookup.
        if (isDuplicateKeyError(error)) {
          try {
            const prior = await findSubmissionByRequestId(requestId);
            if (prior) {
              await tryDeliverNotification(prior.id);
              res.status(200).json(submissionResponse(prior));
              return;
            }
          } catch {
            // Fall through to the safe generic failure below.
          }
        }
        if (error instanceof ZodError) {
          jsonError(res, 400, issueMessage(error));
          return;
        }
        if (
          error instanceof Error &&
          /uploaded files|logo|Attached files/i.test(error.message)
        ) {
          jsonError(res, 400, error.message);
          return;
        }
        console.error("[Partner] Submission failed", error);
        jsonError(res, 500, "Unable to submit the inquiry");
      }
    }
  );

  app.get(
    "/api/partner/notifications/process",
    partnerNoStoreMiddleware,
    async (req, res) => {
      if (!notificationWorkerAuthorized(req.headers.authorization)) {
        jsonError(res, 401, "Authorized scheduler credentials required");
        return;
      }
      try {
        res.json(await processDueNotifications());
      } catch {
        jsonError(
          res,
          503,
          "Notification processing is temporarily unavailable"
        );
      }
    }
  );

  app.post(
    "/api/partner/notifications/process",
    partnerNoStoreMiddleware,
    rateLimit("partner-email-process", 6, 10 * 60 * 1000),
    async (req, res) => {
      if (!(await getAdmin(req, res))) return;
      try {
        res.json(await processDueNotifications());
      } catch {
        jsonError(
          res,
          503,
          "Notification processing is temporarily unavailable"
        );
      }
    }
  );

  app.get(
    "/api/partner/inquiries/:id/notification",
    partnerNoStoreMiddleware,
    async (req, res) => {
      if (!(await getAdmin(req, res))) return;
      if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) {
        jsonError(res, 404, "Notification not found");
        return;
      }
      try {
        const status = await readNotificationStatus(req.params.id);
        if (!status) {
          jsonError(
            res,
            404,
            "No email notification was queued for this inquiry"
          );
          return;
        }
        res.json(status);
      } catch {
        jsonError(res, 503, "Notification status is temporarily unavailable");
      }
    }
  );

  app.post(
    "/api/partner/inquiries/:id/notification/retry",
    partnerNoStoreMiddleware,
    rateLimit("partner-email-retry", 6, 10 * 60 * 1000),
    async (req, res) => {
      if (!(await getAdmin(req, res))) return;
      if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) {
        jsonError(res, 404, "Notification not found");
        return;
      }
      try {
        const previous = await readNotificationStatus(req.params.id);
        if (!previous) {
          jsonError(
            res,
            404,
            "No email notification was queued for this inquiry"
          );
          return;
        }
        await deliverNotification(req.params.id, true);
        res.json(await readNotificationStatus(req.params.id));
      } catch {
        jsonError(res, 503, "Unable to retry this notification");
      }
    }
  );

  app.get(
    "/api/partner/inquiries",
    partnerNoStoreMiddleware,
    async (req, res) => {
      if (!(await getAdmin(req, res))) return;
      try {
        const db = await getDb();
        if (!db) {
          jsonError(res, 503, "Inquiry service is temporarily unavailable");
          return;
        }
        const inquiries = await db
          .select({
            id: partnerInquiries.id,
            company: partnerInquiries.company,
            firstName: partnerInquiries.firstName,
            lastName: partnerInquiries.lastName,
            email: partnerInquiries.email,
            partnerships: partnerInquiries.partnerships,
            submittedAt: partnerInquiries.submittedAt,
          })
          .from(partnerInquiries)
          .orderBy(desc(partnerInquiries.submittedAt));
        res.json(
          inquiries.map(inquiry => ({
            id: inquiry.id,
            company: inquiry.company,
            name: `${inquiry.firstName} ${inquiry.lastName}`.trim(),
            email: inquiry.email,
            partnerships: safeStringArray(inquiry.partnerships),
            submittedAt: responseDate(inquiry.submittedAt),
          }))
        );
      } catch (error) {
        console.error("[Partner] Inquiry list failed", error);
        jsonError(res, 500, "Unable to load inquiries");
      }
    }
  );

  app.get(
    "/api/partner/inquiries/:id",
    partnerNoStoreMiddleware,
    async (req, res) => {
      if (!(await getAdmin(req, res))) return;
      const id = req.params.id;
      if (!/^[0-9a-f-]{36}$/i.test(id)) {
        jsonError(res, 404, "Inquiry not found");
        return;
      }
      try {
        const db = await getDb();
        if (!db) {
          jsonError(res, 503, "Inquiry service is temporarily unavailable");
          return;
        }
        const inquiries = await db
          .select()
          .from(partnerInquiries)
          .where(eq(partnerInquiries.id, id))
          .limit(1);
        const inquiry = inquiries[0];
        if (!inquiry) {
          jsonError(res, 404, "Inquiry not found");
          return;
        }
        const assets = await db
          .select()
          .from(partnerAssets)
          .where(eq(partnerAssets.inquiryId, inquiry.id))
          .orderBy(desc(partnerAssets.createdAt));
        const logo = assets.find(asset => asset.role === "logo") ?? null;
        res.json({
          id: inquiry.id,
          data: safeJsonObject(inquiry.data),
          logo: logo ? publicAsset(logo) : null,
          assets: assets
            .filter(asset => asset.role === "asset")
            .map(publicAsset),
          submittedAt: responseDate(inquiry.submittedAt),
        });
      } catch (error) {
        console.error("[Partner] Inquiry detail failed", error);
        jsonError(res, 500, "Unable to load this inquiry");
      }
    }
  );

  app.get(
    "/api/partner/assets/:id",
    partnerNoStoreMiddleware,
    async (req, res) => {
      if (!(await getAdmin(req, res))) return;
      const id = req.params.id;
      if (!ASSET_ID_PATTERN.test(id)) {
        jsonError(res, 404, "Asset not found");
        return;
      }
      try {
        const db = await getDb();
        if (!db) {
          jsonError(res, 503, "Inquiry service is temporarily unavailable");
          return;
        }
        const assets = await db
          .select()
          .from(partnerAssets)
          .where(eq(partnerAssets.id, id))
          .limit(1);
        const asset = assets[0];
        // Only claimed files are available even to administrators; unsubmitted uploads remain inaccessible.
        if (!asset || asset.inquiryId === null) {
          jsonError(res, 404, "Asset not found");
          return;
        }
        const storageKey = objectStorageKey(asset.dataBase64);
        if (storageKey) {
          const url = await createPrivateDownloadUrl(
            storageKey,
            asset.name,
            asset.type
          );
          res.redirect(302, url);
          return;
        }
        const bytes = Buffer.from(asset.dataBase64, "base64");
        if (
          !MIME_TYPES.has(asset.type) ||
          bytes.length !== asset.size ||
          detectFile(bytes) !== asset.type
        ) {
          console.error("[Partner] Asset integrity check failed", {
            assetId: asset.id,
          });
          jsonError(res, 500, "Unable to retrieve this asset");
          return;
        }
        res.set({
          "Content-Type": asset.type,
          "Content-Length": String(bytes.length),
          "Content-Disposition": contentDisposition(asset.name),
          "Cross-Origin-Resource-Policy": "same-origin",
        });
        res.status(200).send(bytes);
      } catch (error) {
        console.error("[Partner] Asset download failed", error);
        jsonError(res, 500, "Unable to retrieve this asset");
      }
    }
  );
}
