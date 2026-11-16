import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  deleteCoupon,
  getCoupon,
  updateCoupon,
} from "@/services/coupon/coupon.service";
import { updateCouponSchema } from "@/services/coupon/coupon.schema";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/coupons/:id
export const GET = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    return NextResponse.json(await getCoupon(id));
  },
);

// PUT /api/admin/coupons/:id  (partial body is fine — also used to toggle isActive)
export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = updateCouponSchema.parse(await req.json());
    return NextResponse.json(await updateCoupon(id, input));
  },
);

// DELETE /api/admin/coupons/:id
export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    return NextResponse.json(await deleteCoupon(id));
  },
);
