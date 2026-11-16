/**
 * One-time fix: makes the files in your Arvan bucket readable by everyone.
 *
 *   npx tsx scripts/make-bucket-public.ts
 *
 * 1. Tries to set a bucket policy "anyone can GET objects" (covers all future uploads).
 * 2. Sets ACL public-read on every existing object (covers files already uploaded).
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import {
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  PutObjectAclCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

const Bucket = env("STORAGE_BUCKET");
const client = new S3Client({
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

async function main() {
  try {
    await client.send(
      new PutBucketPolicyCommand({
        Bucket,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "PublicRead",
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${Bucket}/*`],
            },
          ],
        }),
      }),
    );
    console.log("Bucket policy set: all objects are publicly readable.");
  } catch (e) {
    console.warn(
      `! Could not set bucket policy (${(e as Error).message}). Falling back to per-object ACLs only.`,
    );
  }

  let token: string | undefined;
  let done = 0;
  do {
    const page = await client.send(
      new ListObjectsV2Command({ Bucket, ContinuationToken: token }),
    );
    for (const obj of page.Contents ?? []) {
      await client.send(
        new PutObjectAclCommand({ Bucket, Key: obj.Key!, ACL: "public-read" }),
      );
      done++;
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  console.log(`ACL public-read applied to ${done} existing objects.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
