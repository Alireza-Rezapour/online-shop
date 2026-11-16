import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  productBasicSchema,
  productListQuerySchema,
} from "@/services/product/product.schema";
import { createProductService } from "@/services/product/product.service";
import { listProductsService } from "@/services/product/product-list.service";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;
  const query = productListQuerySchema.parse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  return NextResponse.json(await listProductsService(query));
});

// Creates the draft (wizard step 1)
export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;
  const input = productBasicSchema.parse(await req.json());
  return NextResponse.json(await createProductService(input), { status: 201 });
});
