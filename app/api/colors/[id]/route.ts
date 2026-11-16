import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { updateColorSchema } from "@/services/color/color.schema";
import {
  deleteColorService,
  getColorByIdService,
  updateColorService,
} from "@/services/color/color.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: Ctx) => {
    const { id } = await params;
    return NextResponse.json(await getColorByIdService(id));
  },
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = updateColorSchema.parse(await req.json());
    return NextResponse.json(await updateColorService(id, input));
  },
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    return NextResponse.json(await deleteColorService(id));
  },
);
