import { NextResponse } from "next/server";
import { updateReviewStatusSchema } from "@/services/review/review.schema";
import { updateReviewStatusService } from "@/services/review/review.service";
import { handle, requireAdminUser } from "@/lib/api/review-route-utils";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/reviews/:id/status   body: { status: "PENDING" | "APPROVED" | "REJECTED" }
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  await requireAdminUser(req);
  const { id } = await params;
  const { status } = updateReviewStatusSchema.parse(await req.json());

  return NextResponse.json(
    await updateReviewStatusService({ reviewId: id, status }),
  );
});
