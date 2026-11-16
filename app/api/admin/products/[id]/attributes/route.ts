import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { productAttributesSchema } from "@/services/product/product.schema";
import { saveProductAttributesService } from "@/services/product/product-attribute.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = productAttributesSchema.parse(await req.json());
    return NextResponse.json(await saveProductAttributesService(id, input));
  },
);
