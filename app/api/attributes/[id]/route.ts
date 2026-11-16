import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { updateAttributeSchema } from "@/services/attribute/attribute.schema";
import {
  deleteAttributeService,
  getAttributeByIdService,
  updateAttributeService,
} from "@/services/attribute/attribute.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: Ctx) => {
    const { id } = await params;
    return NextResponse.json(await getAttributeByIdService(id));
  },
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = updateAttributeSchema.parse(await req.json());
    return NextResponse.json(await updateAttributeService(id, input));
  },
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    return NextResponse.json(await deleteAttributeService(id));
  },
);
