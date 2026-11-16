import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { searchProductsForLookPicker } from "@/services/look/look.service";

export const GET = withErrorHandling(async (req) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const search = new URL(req.url).searchParams.get("search") ?? undefined;
  return NextResponse.json(await searchProductsForLookPicker(search));
});
