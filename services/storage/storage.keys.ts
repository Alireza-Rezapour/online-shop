import { randomUUID } from "crypto";
import { UPLOAD_PURPOSE_CONFIG, UploadPurpose } from "./storage.types";

const MIME_EXTENSION: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
};

export function extensionForMimeType(mimeType: string): string {
  const ext = MIME_EXTENSION[mimeType];
  if (!ext) throw new Error(`پسوند فایل برای نوع ${mimeType} پشتیبانی نمی‌شود`);
  return ext;
}

/**
 * The ONLY place a storage key is generated. Callers never invent a path —
 * this always returns a fresh, unpredictable key under the purpose's prefix.
 */
export function generateStorageKey(
  purpose: UploadPurpose,
  mimeType: string,
): string {
  const { keyPrefix } = UPLOAD_PURPOSE_CONFIG[purpose];
  return `${keyPrefix}/${randomUUID()}.${extensionForMimeType(mimeType)}`;
}
