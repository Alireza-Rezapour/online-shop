import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { createHeroSlideSchema } from "@/services/hero-slide/hero-slide.schema";
import {
  createHeroSlide,
  listHeroSlidesForAdmin,
} from "@/services/hero-slide/hero-slide.service";

export const GET = withErrorHandling(async (req) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  return NextResponse.json(await listHeroSlidesForAdmin());
});

export const POST = withErrorHandling(async (req) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const input = createHeroSlideSchema.parse(await req.json());
  return NextResponse.json(await createHeroSlide(input), { status: 201 });
});
