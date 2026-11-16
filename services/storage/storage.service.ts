import prisma from "@/lib/prisma";
import {
  deleteObject,
  getPresignedUploadUrl,
  getPublicObjectUrl,
  UPLOAD_URL_TTL_SECONDS,
} from "./S3.storage";
import { generateStorageKey } from "./storage.keys";
import {
  PresignedUploadResult,
  UPLOAD_PURPOSE_CONFIG,
  UploadPurpose,
} from "./storage.types";
import { Prisma } from "@/lib/generated/prisma/client";

type Db = typeof prisma | Prisma.TransactionClient;

export class UnsupportedUploadPurposeError extends Error {
  constructor() {
    super("نوع بارگذاری پشتیبانی نمی‌شود");
    this.name = "UnsupportedUploadPurposeError";
  }
}

export class MimeTypeNotAllowedError extends Error {
  constructor() {
    super("نوع فایل ارسالی مجاز نیست");
    this.name = "MimeTypeNotAllowedError";
  }
}

/**
 * Step 1 of the upload flow: the server validates the purpose, picks the
 * key, registers a row with referenceCount 0, and returns a short-lived
 * presigned PUT URL. The browser then uploads straight to the bucket — this
 * call never sees the file bytes.
 */
export async function createPresignedUpload(
  purpose: UploadPurpose,
  mimeType: string,
): Promise<PresignedUploadResult> {
  const config = UPLOAD_PURPOSE_CONFIG[purpose];
  if (!config) throw new UnsupportedUploadPurposeError();
  if (!config.allowedMimeTypes.includes(mimeType))
    throw new MimeTypeNotAllowedError();

  const key = generateStorageKey(purpose, mimeType);

  await prisma.storageObject.create({
    data: {
      key,
      mimeType,
      referenceCount: 0,
      unreferencedAt: new Date(),
    },
  });

  const uploadUrl = await getPresignedUploadUrl(key, mimeType);

  return {
    key,
    uploadUrl,
    method: "PUT",
    headers: { "Content-Type": mimeType },
    expiresIn: UPLOAD_URL_TTL_SECONDS,
  };
}

/**
 * Mark a key as referenced by one more database row (e.g. a saved
 * Product image). Upserts, so it is safe for keys not presigned here.
 */
export async function attachReference(
  key: string | null | undefined,
  db: Db = prisma,
): Promise<void> {
  if (!key) return;
  await db.storageObject.upsert({
    where: { key },
    create: { key, referenceCount: 1, unreferencedAt: null },
    update: { referenceCount: { increment: 1 }, unreferencedAt: null },
  });
}

/**
 * Release one reference. Never deletes the physical object — it only
 * updates the registry so a cleanup job can remove it after a grace period,
 * once nothing references it.
 */
export async function releaseReference(
  key: string | null | undefined,
  db: Db = prisma,
): Promise<void> {
  if (!key) return;
  const existing = await db.storageObject.findUnique({ where: { key } });
  if (!existing) return;

  const nextCount = Math.max(0, existing.referenceCount - 1);
  await db.storageObject.update({
    where: { key },
    data: {
      referenceCount: nextCount,
      unreferencedAt: nextCount === 0 ? new Date() : null,
    },
  });
}

export async function releaseReferences(
  keys: Array<string | null | undefined>,
  db: Db = prisma,
): Promise<void> {
  for (const key of keys) await releaseReference(key, db);
}

/**
 * For single-key fields (Category.image, Collection.image, ...): when the
 * value changes, release the old key and attach the new one.
 */
export async function syncSingleKeyReference(
  oldKey: string | null | undefined,
  newKey: string | null | undefined,
  db: Db = prisma,
): Promise<void> {
  if (oldKey === newKey) return;
  if (oldKey) await releaseReference(oldKey, db);
  if (newKey) await attachReference(newKey, db);
}

/**
 * For multi-key fields (ProductImage rows, ...): release keys that were
 * removed and attach keys that were added. Unchanged keys are untouched.
 */
export async function syncManyKeyReferences(
  oldKeys: string[],
  newKeys: string[],
  db: Db = prisma,
): Promise<void> {
  const oldSet = new Set(oldKeys);
  const newSet = new Set(newKeys);
  const removed = oldKeys.filter((k) => !newSet.has(k));
  const added = newKeys.filter((k) => !oldSet.has(k));
  await releaseReferences(removed, db);
  for (const key of added) await attachReference(key, db);
}

export function getPublicUrlForKey(key: string): string {
  return getPublicObjectUrl(key);
}

/**
 * Physically deletes the object and its registry row. Only call this from
 * the cleanup job (or best-effort after a DB transaction commits) — never
 * inline with a DB write, so a storage failure can't break a good commit.
 */
export async function deleteKeyPhysically(key: string): Promise<void> {
  await deleteObject(key);
  await prisma.storageObject.deleteMany({ where: { key } });
}
