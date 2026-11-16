import { NextResponse, type NextRequest } from "next/server";
import { dashboardQuerySchema } from "@/services/dashboard/dashboard.schema";
import { getDashboardStats } from "@/services/dashboard/dashboard.service";
import type { DashboardRange } from "@/services/dashboard/dashboard.types";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { range } = dashboardQuerySchema.parse({
    range: req.nextUrl.searchParams.get("range") ?? undefined,
  });

  const stats = await getDashboardStats(range as DashboardRange);
  return NextResponse.json(stats);
});
