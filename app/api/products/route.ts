import { withErrorHandling } from "@/lib/api-handler";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { getSession } from "@/lib/session";
import { storeProductListQuerySchema } from "@/services/product/product.schema";
import { getStoreProductsService } from "@/services/product/store-product.service";
import { NextRequest, NextResponse } from "next/server";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const query = storeProductListQuerySchema.parse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  const session = await getSession();
  if (query.favorites && !session) return unauthorizedResponse();

  return NextResponse.json(
    await getStoreProductsService(query, session?.user.id),
  );
});
