import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { reorderHeroSlidesSchema } from "@/services/hero-slide/hero-slide.schema";
import { reorderHeroSlides } from "@/services/hero-slide/hero-slide.service";

export const PATCH = withErrorHandling(async (req) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const input = reorderHeroSlidesSchema.parse(await req.json());
  await reorderHeroSlides(input);
  return NextResponse.json({ success: true });
});
