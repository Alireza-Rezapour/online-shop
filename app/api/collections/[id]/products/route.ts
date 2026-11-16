import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import {
  getCollectionProducts,
  setCollectionProducts,
} from "@/services/collection/collection.service";
import { collectionProductsSchema } from "@/services/collection/collection.schema";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    return NextResponse.json(await getCollectionProducts(id));
  },
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    const { productIds } = collectionProductsSchema.parse(await req.json());
    return NextResponse.json(await setCollectionProducts(id, productIds));
  },
);
