import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getBestSellingProductsService } from "@/services/product/best-selling.service";

// GET /api/products/best-selling?limit=10&days=90
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const limit = sp.has("limit") ? Number(sp.get("limit")) : undefined;
    const days = sp.has("days") ? Number(sp.get("days")) : undefined;

    const session = await auth.api.getSession({ headers: await headers() });

    const items = await getBestSellingProductsService(
      { limit, days },
      session?.user.id,
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error("[best-selling]", error);
    return NextResponse.json(
      { message: "Could not load best-selling products" },
      { status: 500 },
    );
  }
}
