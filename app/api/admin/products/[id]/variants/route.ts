import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { productVariantsSchema } from "@/services/product/product.schema";
import { saveProductVariantsService } from "@/services/product/product-variant.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = productVariantsSchema.parse(await req.json());
    return NextResponse.json(await saveProductVariantsService(id, input));
  },
);
