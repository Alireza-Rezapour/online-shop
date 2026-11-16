import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { ShipmentStatus } from "@/lib/generated/prisma/enums";
import { updateShipmentStatusService } from "@/services/shipment/updateShipmentStatus.service";
import { serviceErrorResponse } from "@/lib/errors/service-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;

  try {
    const { status } = await req.json();

    if (!Object.values(ShipmentStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    return NextResponse.json(await updateShipmentStatusService(id, status));
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
