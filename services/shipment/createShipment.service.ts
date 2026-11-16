import prisma from "@/lib/prisma";

interface CreateShipmentInput {
  orderId: string;
  carrierId: string;
  trackingCode?: string;
}

export async function createShipmentService({
  orderId,
  carrierId,
  trackingCode,
}: CreateShipmentInput) {
  if (!carrierId) throw new Error("carrierId is required.");

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { shipment: true },
    });

    if (!order) throw new Error("Order not found.");

    if (order.shipment) {
      throw new Error(
        "This order already has a shipment — update it instead of creating a new one.",
      );
    }

    // Only a paid order that has not left the warehouse needs a shipment
    if (order.status !== "PAID" && order.status !== "PROCESSING") {
      throw new Error(
        `Shipments can only be created for paid or processing orders (this order is ${order.status}).`,
      );
    }

    const carrier = await tx.carrier.findUnique({
      where: { id: carrierId },
      select: { id: true },
    });
    if (!carrier) throw new Error("Carrier not found.");

    return tx.shipment.create({
      data: {
        orderId,
        carrierId,
        trackingCode: trackingCode?.trim() || null,
        status: "PENDING",
      },
    });
  });
}
