import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { updateSizeChartSchema } from "@/services/size-chart/size-chart.schema";
import {
  deleteSizeChartService,
  getSizeChartByIdService,
  updateSizeChartService,
} from "@/services/size-chart/size-chart.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: Ctx) => {
    const { id } = await params;
    return NextResponse.json(await getSizeChartByIdService(id));
  },
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = updateSizeChartSchema.parse(await req.json());
    return NextResponse.json(await updateSizeChartService(id, input));
  },
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    return NextResponse.json(await deleteSizeChartService(id));
  },
);
