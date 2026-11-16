import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { ShipmentStatus } from "@/lib/generated/prisma/enums";
import { serviceErrorResponse } from "@/lib/errors/service-error";
import { shipmentAdminInclude } from "@/services/shipment/shipment.dto";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  try {
    const status = new URL(req.url).searchParams.get("status");

    if (
      status &&
      !Object.values(ShipmentStatus).includes(status as ShipmentStatus)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const shipments = await prisma.shipment.findMany({
      where: { ...(status && { status: status as ShipmentStatus }) },
      include: shipmentAdminInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(shipments);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
