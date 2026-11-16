import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { getStoreProductsService } from "@/services/product/store-product.service";
import { storeProductListQuerySchema } from "@/services/product/product.schema";
import { serviceErrorResponse } from "@/lib/errors/service-error";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    // The same service as every other product list, limited to this user's favorites
    const { items } = await getStoreProductsService(
      storeProductListQuerySchema.parse({ favorites: "true", pageSize: 200 }),
      session.user.id,
    );
    return NextResponse.json(items);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
