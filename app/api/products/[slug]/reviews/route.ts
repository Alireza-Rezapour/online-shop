import { NextResponse } from "next/server";
import {
  createReviewSchema,
  productReviewsQuerySchema,
} from "@/services/review/review.schema";
import {
  createReviewService,
  getProductReviewsService,
} from "@/services/review/review.service";
import { handle, requireUser } from "@/lib/api/review-route-utils";

type Ctx = { params: Promise<{ slug: string }> };

// GET /api/products/:productId/reviews?page=1&limit=10  (public, approved reviews only)
export const GET = handle(async (req: Request, { params }: Ctx) => {
  const { slug: productId } = await params;
  const query = productReviewsQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );

  return NextResponse.json(
    await getProductReviewsService({ productId, ...query }),
  );
});

// POST /api/products/:productId/reviews  (signed-in users; saved as PENDING)
export const POST = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireUser(req);
  const { slug: productId } = await params;
  const body = createReviewSchema.parse(await req.json());

  // userId always comes from the session, never from the request body
  const review = await createReviewService({
    ...body,
    userId: user.id,
    productId,
  });

  return NextResponse.json(review, { status: 201 });
});
