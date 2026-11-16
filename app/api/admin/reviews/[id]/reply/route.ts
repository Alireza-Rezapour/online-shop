import { NextResponse } from "next/server";
import { replyToReviewSchema } from "@/services/review/review.schema";
import { replyToReviewService } from "@/services/review/review.service";
import { handle, requireAdminUser } from "@/lib/api/review-route-utils";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/reviews/:id/reply   body: { adminReply: string }  (empty string removes the reply)
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  await requireAdminUser(req);
  const { id } = await params;
  const { adminReply } = replyToReviewSchema.parse(await req.json());

  return NextResponse.json(
    await replyToReviewService({ reviewId: id, adminReply }),
  );
});
