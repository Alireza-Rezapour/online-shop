/**
 * Uploads the images in ./seed-images to your Arvan bucket and records what
 * was uploaded in prisma/seed-data/uploaded-images.json (used by the seed).
 *
 *   npm run images:list      -> shows which expected images are present / missing
 *   npm run images:upload    -> uploads (skips files already in the bucket)
 *   npm run images:upload -- --force   -> re-uploads everything
 *   npm run images:upload -- --delete-legacy -> removes files from the old "seed/" folder
 *
 * Uses the same env vars as lib/storage/S3.storage.ts.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import fs from "node:fs";
import path from "node:path";
import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  ALLOWED_EXTENSIONS,
  LEGACY_KEY_PREFIX,
  LOCAL_IMAGE_DIR,
  MIME_BY_EXT,
  expectedImages,
  keyForLogical,
  loadManifest,
  saveManifest,
  type Manifest,
} from "../prisma/seed-data/images";

const args = new Set(process.argv.slice(2));
const LIST_ONLY = args.has("--list");
const FORCE = args.has("--force");
const DELETE_LEGACY = args.has("--delete-legacy");
const CONCURRENCY = 4;
const WARN_SIZE = 1_500_000; // 1.5 MB

type LocalFile = { file: string; ext: string; size: number };

// ───────────── 1. find local files ─────────────
function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

function scanLocal(): { byLogical: Map<string, LocalFile>; unknown: string[] } {
  const byLogical = new Map<string, LocalFile>();
  const unknown: string[] = [];
  for (const file of walk(LOCAL_IMAGE_DIR)) {
    const ext = path.extname(file).slice(1).toLowerCase();
    const rel = path.relative(LOCAL_IMAGE_DIR, file).split(path.sep).join("/");
    if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
      unknown.push(rel);
      continue;
    }
    const logical = rel.slice(0, -(ext.length + 1));
    if (byLogical.has(logical)) {
      console.warn(`! two files for "${logical}", using the first one`);
      continue;
    }
    byLogical.set(logical, { file, ext, size: fs.statSync(file).size });
  }
  return { byLogical, unknown };
}

// ───────────── 2. S3 client (same config as the app) ─────────────
function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

function createClient() {
  return new S3Client({
    endpoint: env("STORAGE_ENDPOINT").replace(/\/$/, ""),
    region: process.env.STORAGE_REGION || "default",
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE !== "false",
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: env("STORAGE_ACCESS_KEY"),
      secretAccessKey: env("STORAGE_SECRET_KEY"),
    },
  });
}

function publicUrl(key: string): string {
  const override = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL?.replace(
    /\/$/,
    "",
  );
  if (override) return `${override}/${key}`;
  const u = new URL(env("STORAGE_ENDPOINT"));
  return `${u.protocol}//${env("STORAGE_BUCKET")}.${u.host}/${key}`;
}

async function existsWithSize(client: S3Client, key: string, size: number) {
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: env("STORAGE_BUCKET"), Key: key }),
    );
    return head.ContentLength === size;
  } catch {
    return false;
  }
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < items.length) await worker(items[i++]);
    }),
  );
}

/** Deletes everything under the old "seed/" prefix (first version of this script). */
async function deleteLegacy() {
  const client = createClient();
  const Bucket = env("STORAGE_BUCKET");
  let token: string | undefined;
  let total = 0;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix: `${LEGACY_KEY_PREFIX}/`,
        ContinuationToken: token,
      }),
    );
    const keys = (page.Contents ?? []).map((o) => ({ Key: o.Key! }));
    if (keys.length) {
      await client.send(
        new DeleteObjectsCommand({ Bucket, Delete: { Objects: keys } }),
      );
      total += keys.length;
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  console.log(`Deleted ${total} files under "${LEGACY_KEY_PREFIX}/"`);
}

// ───────────── 3. main ─────────────
async function main() {
  if (DELETE_LEGACY) {
    await deleteLegacy();
    return;
  }

  const expected = expectedImages();
  const { byLogical, unknown } = scanLocal();

  const missingRequired = expected.filter(
    (e) => e.required && !byLogical.has(e.logical),
  );
  const missingOptional = expected.filter(
    (e) => !e.required && !byLogical.has(e.logical),
  );
  const found = expected.filter((e) => byLogical.has(e.logical));
  const expectedSet = new Set(expected.map((e) => e.logical));
  const unused = [...byLogical.keys()].filter((l) => !expectedSet.has(l));

  console.log(
    `\nExpected: ${expected.length}  | found: ${found.length}  | missing required: ${missingRequired.length}  | missing optional: ${missingOptional.length}\n`,
  );

  if (missingRequired.length) {
    console.log(
      "Missing REQUIRED images (put them in ./seed-images/<name>.webp):",
    );
    for (const m of missingRequired)
      console.log(`  - ${m.logical}   (${m.hint})`);
    console.log();
  }
  if (LIST_ONLY && missingOptional.length) {
    console.log(
      `Missing optional images: ${missingOptional.length} (extra product gallery photos 3 and 4)\n`,
    );
  }
  if (unused.length) {
    console.log(
      "Files that don't match any expected name (they will be ignored):",
    );
    for (const u of unused) console.log(`  - ${u}`);
    console.log();
  }
  if (unknown.length) {
    console.log("Ignored (unsupported extension; use .webp .png .jpg):");
    for (const u of unknown) console.log(`  - ${u}`);
    console.log();
  }

  if (LIST_ONLY) return;
  if (!found.length) {
    console.log("Nothing to upload.");
    return;
  }

  const client = createClient();
  const manifest: Manifest = loadManifest();
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  await runPool(found, async ({ logical }) => {
    const local = byLogical.get(logical)!;
    const ext = local.ext === "jpeg" ? "jpg" : local.ext;
    const key = keyForLogical(logical, ext);
    const mimeType = MIME_BY_EXT[local.ext];

    if (local.size > WARN_SIZE) {
      console.warn(
        `! ${logical} is ${(local.size / 1e6).toFixed(1)} MB; consider compressing it`,
      );
    }

    try {
      if (!FORCE && (await existsWithSize(client, key, local.size))) {
        skipped++;
      } else {
        await client.send(
          new PutObjectCommand({
            Bucket: env("STORAGE_BUCKET"),
            Key: key,
            Body: fs.readFileSync(local.file),
            ContentType: mimeType,
            ACL: "public-read",
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );
        uploaded++;
        console.log(`  uploaded  ${key}`);
      }
      manifest[logical] = { key, size: local.size, mimeType };
    } catch (err) {
      failed++;
      console.error(`  FAILED    ${key}: ${(err as Error).message}`);
    }
  });

  saveManifest(manifest);
  console.log(
    `\nDone. uploaded: ${uploaded}, already there: ${skipped}, failed: ${failed}`,
  );
  console.log("Manifest saved to prisma/seed-data/uploaded-images.json");

  // Quick check that the bucket really is publicly readable
  const sample = Object.values(manifest)[0];
  if (sample) {
    const url = publicUrl(sample.key);
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(
        res.ok
          ? `Public URL works: ${url}`
          : `! Public URL returned ${res.status}: ${url}  (is the bucket public?)`,
      );
    } catch (e) {
      console.log(`! Could not reach ${url}: ${(e as Error).message}`);
    }
  }
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
