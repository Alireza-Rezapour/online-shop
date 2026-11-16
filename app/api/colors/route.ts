import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createColorSchema } from "@/services/color/color.schema";
import {
  createColorService,
  getColorsService,
} from "@/services/color/color.service";
import { withErrorHandling } from "@/lib/api-handler";

// Public: product pages and filters need the color list
export const GET = withErrorHandling(async () => {
  return NextResponse.json(await getColorsService());
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;
  const input = createColorSchema.parse(await req.json());
  return NextResponse.json(await createColorService(input), { status: 201 });
});
