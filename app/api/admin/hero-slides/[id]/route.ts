import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { updateHeroSlideSchema } from "@/services/hero-slide/hero-slide.schema";
import {
  deleteHeroSlide,
  getHeroSlideByIdForAdmin,
  updateHeroSlide,
} from "@/services/hero-slide/hero-slide.service";

export const GET = withErrorHandling<{ id: string }>(async (req, ctx) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  return NextResponse.json(await getHeroSlideByIdForAdmin(id));
});

export const PUT = withErrorHandling<{ id: string }>(async (req, ctx) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const input = updateHeroSlideSchema.parse(await req.json());
  return NextResponse.json(await updateHeroSlide(id, input));
});

export const DELETE = withErrorHandling<{ id: string }>(async (req, ctx) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  await deleteHeroSlide(id);
  return NextResponse.json({ success: true });
});
