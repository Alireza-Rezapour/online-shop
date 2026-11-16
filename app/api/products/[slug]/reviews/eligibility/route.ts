import { NextResponse } from "next/server";
import { getReviewEligibilityService } from "@/services/review/review.service";
import { handle, requireUser } from "@/lib/api/review-route-utils";

// Folder name [slug] must match /api/products/[slug]; the value is the product id
type Ctx = { params: Promise<{ slug: string }> };

// GET /api/products/:productId/reviews/eligibility  (signed-in users)
export const GET = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser(req);
  const { slug: productId } = await params;

  return NextResponse.json(
    await getReviewEligibilityService({ userId: user.id, productId }),
  );
});
