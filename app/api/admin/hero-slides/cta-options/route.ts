import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { heroCtaOptionsQuerySchema } from "@/services/hero-slide/hero-slide.schema";
import { listHeroCtaOptions } from "@/services/hero-slide/hero-slide.service";

// GET /api/admin/hero-slides/cta-options?type=PRODUCT&search=...
export const GET = withErrorHandling(async (req) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const sp = req.nextUrl.searchParams;
  const query = heroCtaOptionsQuerySchema.parse({
    type: sp.get("type"),
    search: sp.get("search") ?? undefined,
  });
  return NextResponse.json(await listHeroCtaOptions(query));
});
