import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { productBasicSchema } from "@/services/product/product.schema";
import {
  getProductAdminService,
  updateProductBasicService,
} from "@/services/product/product.service";
import { withErrorHandling } from "@/lib/api-handler";
import { deleteProductService } from "@/services/product/product-list.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    return NextResponse.json(await getProductAdminService(id));
  },
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = productBasicSchema.parse(await req.json());
    return NextResponse.json(await updateProductBasicService(id, input));
  },
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    return NextResponse.json(await deleteProductService(id));
  },
);
