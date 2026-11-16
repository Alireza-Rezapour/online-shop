import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createCoupon, listCoupons } from "@/services/coupon/coupon.service";
import {
  createCouponSchema,
  listCouponsQuerySchema,
} from "@/services/coupon/coupon.schema";
import { withErrorHandling } from "@/lib/api-handler";

// GET /api/admin/coupons?search=&isActive=&page=&pageSize=
export const GET = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const query = listCouponsQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  return NextResponse.json(await listCoupons(query));
});

// POST /api/admin/coupons
export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const input = createCouponSchema.parse(await req.json());
  return NextResponse.json(await createCoupon(input), { status: 201 });
});
