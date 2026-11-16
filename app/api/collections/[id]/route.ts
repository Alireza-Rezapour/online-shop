import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { updateCollectionSchema } from "@/services/collection/collection.schema";
import {
  deleteCollection,
  updateCollection,
} from "@/services/collection/collection.service";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    const input = updateCollectionSchema.parse(await req.json());
    return NextResponse.json(await updateCollection(id, input));
  },
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    await deleteCollection(id);
    return NextResponse.json({ success: true });
  },
);
