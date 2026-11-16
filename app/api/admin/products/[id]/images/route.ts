import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { productImagesSchema } from "@/services/product/product.schema";
import { saveProductImagesService } from "@/services/product/product-image.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = productImagesSchema.parse(await req.json());
    return NextResponse.json(await saveProductImagesService(id, input));
  },
);
