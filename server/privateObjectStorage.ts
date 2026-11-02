import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "node:crypto";
import { ENV } from "./_core/env";

export type DirectUpload = {
  id: string;
  key: string;
  uploadUrl: string;
};

type ObjectMetadata = {
  size: number;
  type: string;
  prefix: Buffer;
};

let client: S3Client | null = null;

function config() {
  const bucket = ENV.privateUploadBucket;
  const region = ENV.privateUploadRegion;
  if (!bucket || !region) return null;

  return {
    bucket,
    region,
    endpoint: ENV.privateUploadEndpoint || undefined,
    forcePathStyle: ENV.privateUploadForcePathStyle,
    credentials:
      ENV.privateUploadAccessKeyId && ENV.privateUploadSecretAccessKey
        ? {
            accessKeyId: ENV.privateUploadAccessKeyId,
            secretAccessKey: ENV.privateUploadSecretAccessKey,
          }
        : undefined,
  };
}

function getClient() {
  const settings = config();
  if (!settings) return null;
  if (!client) {
    client = new S3Client({
      region: settings.region,
      endpoint: settings.endpoint,
      forcePathStyle: settings.forcePathStyle,
      credentials: settings.credentials,
    });
  }
  return { client, settings };
}

export function privateObjectStorageEnabled(): boolean {
  return config() !== null;
}

export function objectStoragePointer(key: string): string {
  return `s3:${key}`;
}

export function objectStorageKey(value: string): string | null {
  return value.startsWith("s3:") ? value.slice(3) || null : null;
}

function uploadKey(id: string): string {
  return `partner-private/${id}`;
}

export async function createDirectUpload(
  type: string
): Promise<DirectUpload | null> {
  const storage = getClient();
  if (!storage) return null;
  const id = randomBytes(32).toString("base64url");
  const key = uploadKey(id);
  const uploadUrl = await getSignedUrl(
    storage.client,
    new PutObjectCommand({
      Bucket: storage.settings.bucket,
      Key: key,
      ContentType: type,
    }),
    { expiresIn: 10 * 60 }
  );
  return { id, key, uploadUrl };
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (!body || typeof body !== "object" || !(Symbol.asyncIterator in body)) {
    throw new Error("Object body is unavailable");
  }
  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<
    Uint8Array | Buffer | string
  >) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Confirms an uploaded object exists, has the claimed size, and begins with an
 * allowed file signature without routing the original browser upload through a
 * Vercel Function.
 */
export async function inspectPrivateObject(
  key: string
): Promise<ObjectMetadata> {
  const storage = getClient();
  if (!storage) throw new Error("Private object storage is not configured");
  const head = await storage.client.send(
    new HeadObjectCommand({ Bucket: storage.settings.bucket, Key: key })
  );
  const size = head.ContentLength ?? -1;
  const type = head.ContentType?.toLowerCase() ?? "";
  if (size < 1 || !type) throw new Error("Uploaded object is incomplete");

  const sample = await storage.client.send(
    new GetObjectCommand({
      Bucket: storage.settings.bucket,
      Key: key,
      Range: "bytes=0-1048575",
    })
  );
  return { size, type, prefix: await streamToBuffer(sample.Body) };
}

export async function deletePrivateObject(key: string): Promise<void> {
  const storage = getClient();
  if (!storage) return;
  await storage.client.send(
    new DeleteObjectCommand({ Bucket: storage.settings.bucket, Key: key })
  );
}

export async function createPrivateDownloadUrl(
  key: string,
  name: string,
  type: string
): Promise<string> {
  const storage = getClient();
  if (!storage) throw new Error("Private object storage is not configured");
  const safeName = name.replace(/["\\\r\n]/g, "_");
  return getSignedUrl(
    storage.client,
    new GetObjectCommand({
      Bucket: storage.settings.bucket,
      Key: key,
      ResponseContentType: type,
      ResponseContentDisposition: `attachment; filename="${safeName}"`,
    }),
    { expiresIn: 5 * 60 }
  );
}
