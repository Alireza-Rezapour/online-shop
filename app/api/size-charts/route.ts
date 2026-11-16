import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createSizeChartSchema } from "@/services/size-chart/size-chart.schema";
import {
  createSizeChartService,
  getSizeChartsService,
} from "@/services/size-chart/size-chart.service";
import { withErrorHandling } from "@/lib/api-handler";

// Public: product pages need the size lists
export const GET = withErrorHandling(async () => {
  return NextResponse.json(await getSizeChartsService());
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;
  const input = createSizeChartSchema.parse(await req.json());
  return NextResponse.json(await createSizeChartService(input), {
    status: 201,
  });
});
