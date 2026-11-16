import { NextResponse } from "next/server";
import {
  deleteReviewService,
  getAdminReviewByIdService,
} from "@/services/review/review.service";
import { handle, requireAdminUser } from "@/lib/api/review-route-utils";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/reviews/:id
export const GET = handle(async (req: Request, { params }: Ctx) => {
  await requireAdminUser(req);
  const { id } = await params;

  return NextResponse.json(await getAdminReviewByIdService(id));
});

// DELETE /api/admin/reviews/:id  -> { id, productId }
export const DELETE = handle(async (req: Request, { params }: Ctx) => {
  await requireAdminUser(req);
  const { id } = await params;

  return NextResponse.json(await deleteReviewService(id));
});
