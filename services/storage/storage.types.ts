/**
 * Central type definitions for the storage layer.
 *
 * There is one public bucket, so there is no "scope" any more — a purpose
 * only decides the key prefix, allowed mime types and size limit.
 *
 * Safe to import from client components (no server-only dependencies): the
 * upload field reuses UPLOAD_PURPOSE_CONFIG for accept / size validation.
 */

/**
 * Every kind of file the app uploads. To add a new upload surface, add one
 * entry here and one entry in UPLOAD_PURPOSE_CONFIG.
 */
export enum UploadPurpose {
  PRODUCT_IMAGE = "PRODUCT_IMAGE",
  CATEGORY_IMAGE = "CATEGORY_IMAGE",
  COLLECTION_IMAGE = "COLLECTION_IMAGE",
  LOOK_IMAGE = "LOOK_IMAGE",
  HERO_SLIDE_IMAGE = "HERO_SLIDE_IMAGE",
}

export interface UploadPurposeConfig {
  /** Directory the generated key lives under. */
  keyPrefix: string;
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}

const IMAGE_MIME_TYPES = ["image/webp", "image/png", "image/jpeg"];
const MB = 1024 * 1024;

export const UPLOAD_PURPOSE_CONFIG: Record<UploadPurpose, UploadPurposeConfig> =
  {
    [UploadPurpose.PRODUCT_IMAGE]: {
      keyPrefix: "images/products",
      allowedMimeTypes: IMAGE_MIME_TYPES,
      maxSizeBytes: 5 * MB,
    },
    [UploadPurpose.CATEGORY_IMAGE]: {
      keyPrefix: "images/categories",
      allowedMimeTypes: IMAGE_MIME_TYPES,
      maxSizeBytes: 5 * MB,
    },
    [UploadPurpose.COLLECTION_IMAGE]: {
      keyPrefix: "images/collections",
      allowedMimeTypes: IMAGE_MIME_TYPES,
      maxSizeBytes: 5 * MB,
    },
    [UploadPurpose.LOOK_IMAGE]: {
      keyPrefix: "images/looks",
      allowedMimeTypes: IMAGE_MIME_TYPES,
      maxSizeBytes: 5 * MB,
    },
    [UploadPurpose.HERO_SLIDE_IMAGE]: {
      keyPrefix: "images/hero-slides",
      allowedMimeTypes: IMAGE_MIME_TYPES,
      maxSizeBytes: 5 * MB,
    },
  };

export interface PresignedUploadResult {
  key: string;
  uploadUrl: string;
  /** HTTP method + headers the browser must send with the PUT. */
  method: "PUT";
  headers: Record<string, string>;
  expiresIn: number;
}
