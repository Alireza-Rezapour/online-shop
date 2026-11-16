import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * The only file in the project that knows about S3 / Arvan Cloud.
 * Everything above this module talks in terms of "key".
 *
 * There is a single public bucket. Objects are readable by anyone with the
 * URL; uploads are only possible through short-lived presigned PUT URLs.
 */

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`متغیر محیطی ${name} تنظیم نشده است`);
  return value;
}

// Read lazily so a missing variable doesn't crash `next build`.
function config() {
  return {
    endpoint: env("STORAGE_ENDPOINT").replace(/\/$/, ""),
    region: process.env.STORAGE_REGION || "default",
    bucket: env("STORAGE_BUCKET"),
    // Path-style avoids bucket-as-subdomain DNS/TLS issues on S3-compatible
    // providers. Set STORAGE_FORCE_PATH_STYLE=false to turn it off.
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE !== "false",
  };
}

export const UPLOAD_URL_TTL_SECONDS = Number(
  process.env.STORAGE_UPLOAD_URL_TTL_SECONDS || 600,
);

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  const { endpoint, region, forcePathStyle } = config();
  client = new S3Client({
    endpoint,
    region,
    forcePathStyle,
    // Newer SDK versions add CRC32 checksum params to presigned URLs, which
    // S3-compatible providers often reject. Only compute them when required.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: env("STORAGE_ACCESS_KEY"),
      secretAccessKey: env("STORAGE_SECRET_KEY"),
    },
  });
  return client;
}

export function getBucket(): string {
  return config().bucket;
}

/**
 * Public URL of an object. Prefer setting
 * NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL (also used by the browser helper in
 * storage.public-url.ts); otherwise falls back to Arvan's
 * https://<bucket>.<endpoint-host>/<key> form.
 */
export function getPublicObjectUrl(key: string): string {
  const override = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL?.replace(
    /\/$/,
    "",
  );
  if (override) return `${override}/${key}`;
  const { endpoint, bucket } = config();
  const u = new URL(endpoint);
  return `${u.protocol}//${bucket}.${u.host}/${key}`;
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = UPLOAD_URL_TTL_SECONDS,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key }),
  );
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await getClient().send(
      new HeadObjectCommand({ Bucket: getBucket(), Key: key }),
    );
    return true;
  } catch (err) {
    const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === "NotFound") {
      return false;
    }
    throw err;
  }
}
