import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { productPublishSchema } from "@/services/product/product.schema";
import { setProductPublishedService } from "@/services/product/product.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const { isPublished } = productPublishSchema.parse(await req.json());
    return NextResponse.json(await setProductPublishedService(id, isPublished));
  },
);
