import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { updateCarrierSchema } from "@/services/carrier/carrier.schema";
import {
  deleteCarrier,
  updateCarrier,
} from "@/services/carrier/carrier.service";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling<{ id: string }>(
  async (req, { params }: Ctx) => {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    const input = updateCarrierSchema.parse(await req.json());
    return NextResponse.json(await updateCarrier(id, input));
  },
);

export const DELETE = withErrorHandling<{ id: string }>(
  async (req, { params }: Ctx) => {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await params;
    await deleteCarrier(id);
    return NextResponse.json({ success: true });
  },
);
