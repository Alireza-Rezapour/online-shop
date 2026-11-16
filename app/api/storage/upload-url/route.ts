import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { RequestUploadUrlSchema } from "@/services/storage/storage.schema";
import {
  createPresignedUpload,
  MimeTypeNotAllowedError,
  UnsupportedUploadPurposeError,
} from "@/services/storage/storage.service";

// POST /api/storage/upload-url — admin only.
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const parsed = RequestUploadUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ورودی نامعتبر", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { purpose, mimeType } = parsed.data;

  try {
    const result = await createPresignedUpload(purpose, mimeType);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (
      err instanceof UnsupportedUploadPurposeError ||
      err instanceof MimeTypeNotAllowedError
    )
      return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
