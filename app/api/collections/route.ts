import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import {
  createCollection,
  listCollections,
} from "@/services/collection/collection.service";
import { createCollectionSchema } from "@/services/collection/collection.schema";

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listCollections());
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const input = createCollectionSchema.parse(await req.json());
  return NextResponse.json(await createCollection(input), { status: 201 });
});
