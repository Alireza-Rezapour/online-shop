import fs from "node:fs";
import path from "node:path";
import {
  collections,
  flattenCategories,
  heroSlides,
  looks,
  products,
} from "./catalog";

/**
 * Every image is identified by a "logical path" such as
 *   categories/men
 *   products/men-polo-pique/1
 * You put a file with that name (any of .webp .png .jpg) into ./seed-images,
 * the upload script sends it to the bucket under `seed/<logical>.<ext>`,
 * and writes the result into the manifest below. The seed only ever
 * references keys that are listed in the manifest.
 */

/** Same prefixes as UPLOAD_PURPOSE_CONFIG in storage.types.ts */
const FOLDER_BY_GROUP: Record<string, string> = {
  products: "images/products",
  categories: "images/categories",
  collections: "images/collections",
  looks: "images/looks",
  hero: "images/hero-slides",
};

/** Old location used by the first version of the script (kept for cleanup). */
export const LEGACY_KEY_PREFIX = "seed";

/**
 * Bucket key for a logical image, e.g.
 *   products/men-polo-pique/1 -> images/products/seed-men-polo-pique-1.webp
 *   categories/men            -> images/categories/seed-men.webp
 *   hero/slide-1-desktop      -> images/hero-slides/seed-slide-1-desktop.webp
 * Flat like the keys the app generates; the "seed-" part marks demo files.
 */
export function keyForLogical(logical: string, ext: string): string {
  const [group, ...rest] = logical.split("/");
  const folder = FOLDER_BY_GROUP[group];
  if (!folder) throw new Error(`Unknown image group "${group}"`);
  return `${folder}/seed-${rest.join("-")}.${ext}`;
}
export const LOCAL_IMAGE_DIR = path.resolve(process.cwd(), "seed-images");
export const MANIFEST_PATH = path.resolve(
  process.cwd(),
  "prisma/seed-data/uploaded-images.json",
);

export const ALLOWED_EXTENSIONS = ["webp", "png", "jpg", "jpeg"] as const;
export const MIME_BY_EXT: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export type ManifestEntry = { key: string; size: number; mimeType: string };
export type Manifest = Record<string, ManifestEntry>;

export type ExpectedImage = {
  logical: string;
  required: boolean;
  hint: string;
};

/** Product images: 1 = cover, 2 = hover, 3 and 4 = extra gallery (optional). */
export const productImageLogical = (slug: string, n: 1 | 2 | 3 | 4) =>
  `products/${slug}/${n}`;

export function expectedImages(): ExpectedImage[] {
  const list: ExpectedImage[] = [];

  for (const slide of heroSlides) {
    list.push({
      logical: `hero/${slide.key}-desktop`,
      required: true,
      hint: "hero desktop (wide, ~2400x800)",
    });
    list.push({
      logical: `hero/${slide.key}-mobile`,
      required: true,
      hint: "hero mobile (~1600x800)",
    });
  }

  // Images only for top-level and second-level categories
  for (const c of flattenCategories().filter((c) => c.depth < 3)) {
    list.push({
      logical: `categories/${c.slug}`,
      required: true,
      hint: `category: ${c.name}`,
    });
  }

  for (const c of collections) {
    list.push({
      logical: `collections/${c.slug}`,
      required: true,
      hint: `collection: ${c.name}`,
    });
  }

  for (const l of looks) {
    list.push({
      logical: `looks/${l.slug}`,
      required: true,
      hint: `look: ${l.title}`,
    });
  }

  for (const p of products) {
    list.push({
      logical: productImageLogical(p.slug, 1),
      required: true,
      hint: `cover: ${p.title}`,
    });
    list.push({
      logical: productImageLogical(p.slug, 2),
      required: true,
      hint: `hover: ${p.title}`,
    });
    list.push({
      logical: productImageLogical(p.slug, 3),
      required: false,
      hint: `gallery: ${p.title}`,
    });
    list.push({
      logical: productImageLogical(p.slug, 4),
      required: false,
      hint: `gallery: ${p.title}`,
    });
  }

  return list;
}

export function loadManifest(): Manifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
  } catch {
    return {};
  }
}

export function saveManifest(manifest: Manifest): void {
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + "\n");
}
