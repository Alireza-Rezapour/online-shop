import prisma from "@/lib/prisma";

interface UpdateShipmentInput {
  shipmentId: string;
  carrierId?: string;
  trackingCode?: string;
}

/**
 * Updates carrier / tracking code only. Status changes go through
 * updateShipmentStatusService since that path also syncs the Order.
 */
export async function updateShipmentService({
  shipmentId,
  carrierId,
  trackingCode,
}: UpdateShipmentInput) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });
  if (!shipment) throw new Error("Shipment not found.");

  if (carrierId !== undefined) {
    const carrier = await prisma.carrier.findUnique({
      where: { id: carrierId },
      select: { id: true },
    });
    if (!carrier) throw new Error("Carrier not found.");
  }

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      ...(carrierId !== undefined && { carrierId }),
      ...(trackingCode !== undefined && {
        trackingCode: trackingCode.trim() || null,
      }),
    },
  });
}
