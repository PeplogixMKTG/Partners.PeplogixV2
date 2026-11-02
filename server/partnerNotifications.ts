import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { and, asc, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { z } from "zod";
import {
  partnerNotifications,
  type PartnerAsset,
  type PartnerNotification,
} from "../drizzle/schema";
import type { PartnerInquiryData } from "../shared/partner";
import { getDb } from "./db";
import { renderPartnerEmail } from "./partnerEmailTemplate";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;
const CLAIM_LEASE_MS = 120_000;
// Resend retains idempotency keys for 24 hours. Stop before that boundary so an
// ambiguous timeout cannot cause a duplicate when retried after key expiration.
const SAFE_RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 8;

const emailAddress = z.string().email().max(320);
const payloadSchema = z
  .object({
    from: z.string().min(1).max(500),
    to: z.array(emailAddress).min(1).max(50),
    subject: z.string().min(1).max(300),
    html: z.string(),
    text: z.string(),
    reply_to: emailAddress,
  })
  .strict();
export type NotificationPayload = z.infer<typeof payloadSchema>;

/** Missing settings disable new email enqueueing; they never break saved leads. */
export function notificationConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.PARTNER_NOTIFICATION_FROM?.trim();
  const rawTo = process.env.PARTNER_NOTIFICATION_TO?.trim();
  const base = process.env.APP_BASE_URL?.trim();
  if (!apiKey || !from || !rawTo || !base) return null;
  if (/[\r\n\x00]/.test(from)) return null;
  const sender = from.match(/^[^<>]*<([^<>]+)>$/)?.[1] ?? from;
  if (!emailAddress.safeParse(sender.trim()).success) return null;
  const to = [
    ...new Set(
      rawTo
        .split(/[,;\n]/)
        .map(value => value.trim())
        .filter(Boolean)
    ),
  ];
  if (
    !to.length ||
    to.length > 50 ||
    to.some(value => !emailAddress.safeParse(value).success)
  )
    return null;
  try {
    const url = new URL(base);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    return { apiKey, from, to, appBaseUrl: url.origin };
  } catch {
    return null;
  }
}

/** Called inside the inquiry transaction, after upload ownership is validated. */
export function buildNotificationRecord(input: {
  id: string;
  submittedAt: Date;
  data: PartnerInquiryData;
  assets: Pick<PartnerAsset, "name" | "type" | "size" | "role">[];
}) {
  const config = notificationConfig();
  if (!config) return null;
  const rendered = renderPartnerEmail({
    ...input,
    appBaseUrl: config.appBaseUrl,
  });
  const payload = payloadSchema.parse({
    from: config.from,
    to: config.to,
    ...rendered,
  });
  return { inquiryId: input.id, payload: JSON.stringify(payload) };
}

export class NotificationSendError extends Error {
  constructor(
    public readonly code: string,
    public readonly retryable: boolean
  ) {
    super(code);
    this.name = "NotificationSendError";
  }
}

/** Bounded and awaited: do not start detached network work in a Vercel Function. */
export async function sendResendNotification(
  payload: NotificationPayload,
  inquiryId: string,
  apiKey: string,
  fetcher: typeof fetch = fetch
): Promise<string> {
  let response: Response;
  try {
    response = await fetcher(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `peplogix-inquiry/${inquiryId}`,
      },
      body: JSON.stringify(payloadSchema.parse(payload)),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
  } catch {
    throw new NotificationSendError("resend_network_or_timeout", true);
  }
  if (!response.ok) {
    // Store only a safe status code, never a provider body containing contacts or keys.
    throw new NotificationSendError(
      `resend_http_${response.status}`,
      response.status === 409 ||
        response.status === 429 ||
        response.status >= 500
    );
  }
  const body: unknown = await response.json().catch(() => null);
  const parsed = z.object({ id: z.string().min(1).max(128) }).safeParse(body);
  if (!parsed.success)
    throw new NotificationSendError("resend_invalid_response", true);
  return parsed.data.id;
}

export function shouldReviewNotification(
  row: Pick<PartnerNotification, "attempts" | "firstAttemptAt">,
  now: Date
) {
  return (
    row.attempts >= MAX_ATTEMPTS ||
    Boolean(
      row.firstAttemptAt &&
        now.getTime() - row.firstAttemptAt.getTime() >= SAFE_RETRY_WINDOW_MS
    )
  );
}

export function notificationStatus(row: PartnerNotification) {
  return {
    inquiryId: row.inquiryId,
    status: row.status,
    attempts: row.attempts,
    providerId: row.providerId,
    lastError: row.lastError,
    nextAttemptAt: row.nextAttemptAt.toISOString(),
    sentAt: row.sentAt?.toISOString() ?? null,
  };
}

/** Atomic leased claim prevents concurrent requests from sending two alerts. */
async function claimNotification(inquiryId: string, force: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.transaction(async tx => {
    const [row] = await tx
      .select()
      .from(partnerNotifications)
      .where(eq(partnerNotifications.inquiryId, inquiryId))
      .limit(1)
      .for("update");
    const now = new Date();
    if (!row || row.status === "sent") return null;
    // A corrected key/verified domain can recover a definite 4xx rejection on
    // explicit admin retry, without permitting ambiguous expired sends to repeat.
    const definiteRejection = /^resend_http_(400|401|403|404|405|422)$/.test(
      row.lastError ?? ""
    );
    if (row.status === "needs_review" && !(force && definiteRejection))
      return null;
    if (row.status === "sending" && row.leaseUntil && row.leaseUntil > now)
      return null;
    if (!force && row.nextAttemptAt > now) return null;
    if (shouldReviewNotification(row, now)) {
      await tx
        .update(partnerNotifications)
        .set({
          status: "needs_review",
          claimToken: null,
          leaseUntil: null,
          lastError: "retry_window_or_attempt_limit",
        })
        .where(eq(partnerNotifications.inquiryId, inquiryId));
      return null;
    }
    const token = randomUUID();
    await tx
      .update(partnerNotifications)
      .set({
        status: "sending",
        claimToken: token,
        attempts: row.attempts + 1,
        firstAttemptAt: row.firstAttemptAt ?? now,
        leaseUntil: new Date(now.getTime() + CLAIM_LEASE_MS),
      })
      .where(eq(partnerNotifications.inquiryId, inquiryId));
    return { ...row, attempts: row.attempts + 1, claimToken: token };
  });
}

export async function deliverNotification(
  inquiryId: string,
  force = false
): Promise<void> {
  const config = notificationConfig();
  if (!config) return;
  const row = await claimNotification(inquiryId, force);
  if (!row) return;
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const ownership = and(
    eq(partnerNotifications.inquiryId, inquiryId),
    eq(partnerNotifications.claimToken, row.claimToken)
  );
  try {
    const payload = payloadSchema.parse(JSON.parse(row.payload));
    const providerId = await sendResendNotification(
      payload,
      inquiryId,
      config.apiKey
    );
    await db
      .update(partnerNotifications)
      .set({
        status: "sent",
        providerId,
        sentAt: new Date(),
        claimToken: null,
        leaseUntil: null,
        lastError: null,
      })
      .where(ownership);
  } catch (error) {
    const known = error instanceof NotificationSendError;
    const retryable = known && error.retryable;
    await db
      .update(partnerNotifications)
      .set({
        status: retryable ? "failed" : "needs_review",
        lastError: known ? error.code : "notification_state_or_payload_error",
        nextAttemptAt: new Date(
          Date.now() + Math.min(60 * 2 ** row.attempts, 3600) * 1000
        ),
        claimToken: null,
        leaseUntil: null,
      })
      .where(ownership);
  }
}

/** Notification failure must never turn an already committed inquiry into a failure. */
export async function tryDeliverNotification(inquiryId: string): Promise<void> {
  try {
    await deliverNotification(inquiryId);
  } catch {
    console.error("[Partner email] Delivery state requires review", {
      inquiryId,
    });
  }
}

export async function readNotificationStatus(inquiryId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [row] = await db
    .select()
    .from(partnerNotifications)
    .where(eq(partnerNotifications.inquiryId, inquiryId))
    .limit(1);
  return row ? notificationStatus(row) : null;
}

/** A scheduler must actually be configured before this becomes automatic. */
export function notificationWorkerAuthorized(
  authorization: string | undefined
): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32 || !authorization) return false;
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  const received = createHash("sha256").update(authorization).digest();
  return timingSafeEqual(expected, received);
}

/** Drain at most two due records per invocation, keeping function runtime bounded. */
export async function processDueNotifications() {
  if (!notificationConfig()) return { enabled: false, processed: 0 };
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const now = new Date();
  const rows = await db
    .select({ inquiryId: partnerNotifications.inquiryId })
    .from(partnerNotifications)
    .where(
      and(
        inArray(partnerNotifications.status, ["pending", "failed", "sending"]),
        lte(partnerNotifications.nextAttemptAt, now),
        or(
          isNull(partnerNotifications.leaseUntil),
          lte(partnerNotifications.leaseUntil, now)
        )
      )
    )
    .orderBy(asc(partnerNotifications.nextAttemptAt))
    .limit(2);
  for (const row of rows) await tryDeliverNotification(row.inquiryId);
  return { enabled: true, processed: rows.length };
}
