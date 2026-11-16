import prisma from "@/lib/prisma";
import { OrderStatus, ShipmentStatus } from "@/lib/generated/prisma/enums";
import { assertValidOrderStatusTransition } from "./orderStatusTransitions";

interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

/**
 * Handles every manual order status transition except CANCELLED (stock
 * restoration lives in cancelOrderService) and PAID (an order only becomes PAID
 * through payment verification, which also moves the stock).
 *
 * SHIPPED / DELIVERED / RETURNED also update the linked Shipment in the same
 * transaction so the two records never disagree.
 */
export async function updateOrderStatusService({
  orderId,
  status,
}: UpdateOrderStatusInput) {
  if (status === "CANCELLED") {
    throw new Error("Use the cancel-order action to cancel an order.");
  }
  if (status === "PAID") {
    throw new Error(
      "An order becomes PAID only when its payment is confirmed.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { shipment: true },
    });

    if (!order) throw new Error("Order not found.");

    assertValidOrderStatusTransition(order.status, status);

    const moved = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status },
    });
    if (moved.count === 0) {
      throw new Error("The order was just updated. Please try again.");
    }

    if (order.shipment) {
      const shipmentData: {
        status?: ShipmentStatus;
        shippedAt?: Date;
        deliveredAt?: Date;
      } = {};

      if (status === "SHIPPED") {
        shipmentData.status = "SHIPPED";
        if (!order.shipment.shippedAt) shipmentData.shippedAt = new Date();
      } else if (status === "DELIVERED") {
        shipmentData.status = "DELIVERED";
        if (!order.shipment.deliveredAt) shipmentData.deliveredAt = new Date();
      } else if (status === "RETURNED") {
        shipmentData.status = "RETURNED";
      }

      if (Object.keys(shipmentData).length > 0) {
        await tx.shipment.update({
          where: { id: order.shipment.id },
          data: shipmentData,
        });
      }
    }

    return tx.order.findUniqueOrThrow({ where: { id: orderId } });
  });
}
