import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getSession, isAdminSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { serviceErrorResponse } from "@/lib/errors/service-error";
import { createShipmentService } from "@/services/shipment/createShipment.service";
import { shipmentWithCarrierInclude } from "@/services/shipment/shipment.dto";
import { createShipmentSchema } from "@/services/shipment/shipment.schema";

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { orderId } = await params;

  try {
    const shipment = await prisma.shipment.findFirst({
      where: {
        orderId,
        ...(isAdminSession(session)
          ? {}
          : { order: { userId: session.user.id } }),
      },
      include: shipmentWithCarrierInclude,
    });
    if (!shipment) {
      return NextResponse.json(
        { message: "Shipment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(shipment);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { orderId } = await params;

  try {
    const body = createShipmentSchema.parse(await req.json());
    const shipment = await createShipmentService({ orderId, ...body });
    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
