import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getSession, isAdminSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { serviceErrorResponse } from "@/lib/errors/service-error";
import { updateShipmentService } from "@/services/shipment/updateShipment.service";
import { updateShipmentSchema } from "@/services/shipment/shipment.schema";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  try {
    const shipment = await prisma.shipment.findFirst({
      where: {
        id,
        ...(isAdminSession(session)
          ? {}
          : { order: { userId: session.user.id } }),
      },
      include: { order: true, carrier: true },
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

export async function PUT(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;

  try {
    const body = updateShipmentSchema.parse(await req.json());
    const shipment = await updateShipmentService({ shipmentId: id, ...body });
    return NextResponse.json(shipment);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

// A shipment that already left the warehouse is history and stays
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;

  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      select: { status: true, orderId: true },
    });
    if (!shipment) {
      return NextResponse.json(
        { message: "Shipment not found" },
        { status: 404 },
      );
    }
    if (!["PENDING", "PACKING"].includes(shipment.status)) {
      return NextResponse.json(
        { error: "A shipment that has already been sent cannot be deleted." },
        { status: 400 },
      );
    }

    await prisma.shipment.delete({ where: { id } });
    return NextResponse.json({ id, orderId: shipment.orderId });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
