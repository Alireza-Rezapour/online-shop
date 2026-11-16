import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { previewCoupon } from "@/services/coupon/coupon.service";
import { validateCouponSchema } from "@/services/coupon/coupon.schema";
import { withErrorHandling } from "@/lib/api-handler";

// POST /api/coupons/validate  { code, items: [{ variantId, quantity }] }
// Never trusts a client subtotal — it is recomputed from the DB.
// A visitor who is not logged in can still preview a coupon; the one-use-per-user
// rule is then enforced when the order is created (applyCoupon).
export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth.api.getSession({ headers: await headers() });

  const input = validateCouponSchema.parse(await req.json());
  return NextResponse.json(await previewCoupon(session?.user.id, input));
});
