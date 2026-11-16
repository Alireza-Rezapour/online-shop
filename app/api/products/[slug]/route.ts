import { NextRequest, NextResponse } from "next/server";
import { getStoreProductBySlugService } from "@/services/product/store-product.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: Ctx) => {
    const { slug } = await params;
    // Persian slugs arrive percent-encoded
    return NextResponse.json(
      await getStoreProductBySlugService(decodeURIComponent(slug)),
    );
  },
);
