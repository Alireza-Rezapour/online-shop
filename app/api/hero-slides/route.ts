import { NextResponse } from "next/server";
import { listActiveHeroSlidesForStorefront } from "@/services/hero-slide/hero-slide.service";
import { withErrorHandling } from "@/lib/api-handler";

// Public: active slides inside their start/end window, sorted by sortOrder.
export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listActiveHeroSlidesForStorefront());
});
