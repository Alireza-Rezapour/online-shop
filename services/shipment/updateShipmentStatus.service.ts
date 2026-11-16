import { OrderStatus, ShipmentStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { assertValidShipmentStatusTransition } from "./shipmentStatus.service";
import { assertValidOrderStatusTransition } from "../order/orderStatusTransitions";

const SHIPMENT_TO_ORDER_STATUS: Partial<Record<ShipmentStatus, OrderStatus>> = {
  PACKING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
};

export async function updateShipmentStatusService(
  shipmentId: string,
  status: ShipmentStatus,
) {
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: true },
    });

    if (!shipment) throw new Error("Shipment not found.");

    assertValidShipmentStatusTransition(shipment.status, status);

    // The order must be allowed to follow the shipment: validated, never forced
    const nextOrderStatus = SHIPMENT_TO_ORDER_STATUS[status];
    const orderNeedsUpdate =
      !!nextOrderStatus && shipment.order.status !== nextOrderStatus;

    if (orderNeedsUpdate) {
      // A shipment can leave straight from PAID, which passes through PROCESSING
      const from =
        shipment.order.status === "PAID" && nextOrderStatus === "SHIPPED"
          ? "PROCESSING"
          : shipment.order.status;
      assertValidOrderStatusTransition(from, nextOrderStatus);
    }

    const shipmentData: {
      status: ShipmentStatus;
      shippedAt?: Date;
      deliveredAt?: Date;
    } = { status };

    if (status === "SHIPPED" && !shipment.shippedAt)
      shipmentData.shippedAt = new Date();
    if (status === "DELIVERED" && !shipment.deliveredAt) {
      shipmentData.deliveredAt = new Date();
    }

    const updatedShipment = await tx.shipment.update({
      where: { id: shipmentId },
      data: shipmentData,
    });

    if (orderNeedsUpdate) {
      const moved = await tx.order.updateMany({
        where: { id: shipment.orderId, status: shipment.order.status },
        data: { status: nextOrderStatus },
      });
      if (moved.count === 0) {
        throw new Error("The order was just updated. Please try again.");
      }
    }

    return updatedShipment;
  });
}
