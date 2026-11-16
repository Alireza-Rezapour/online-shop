import { NextResponse } from "next/server";
import { adminListReviewsQuerySchema } from "@/services/review/review.schema";
import { adminListReviewsService } from "@/services/review/review.service";
import { handle, requireAdminUser } from "@/lib/api/review-route-utils";

// GET /api/admin/reviews?status=PENDING&productId=&userId=&page=1&limit=20
export const GET = handle(async (req: Request) => {
  await requireAdminUser(req);

  const query = adminListReviewsQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );

  return NextResponse.json(await adminListReviewsService(query));
});
