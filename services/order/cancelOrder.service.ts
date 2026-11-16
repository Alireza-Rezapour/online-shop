import prisma from "@/lib/prisma";
import { assertValidOrderStatusTransition } from "./orderStatusTransitions";
import { releaseCoupon } from "../coupon/coupon.service";

type Actor = { userId: string; isAdmin: boolean };

/**
 * Cancels an order and puts its stock back where it belongs. What "back" means
 * depends on how far the order got:
 * - PENDING with a pending payment: stock is only RESERVED, so the reservation
 *   is released and the payment is marked FAILED.
 * - PENDING without a payment: nothing was reserved, nothing to restore.
 * - PAID / PROCESSING: stock was already deducted at payment, so it is added
 *   back, and a shipment that has not left the warehouse is removed.
 * A used coupon is given back in every case.
 *
 * Without `actor` it behaves as admin. A customer actor can only cancel their
 * own unpaid order.
 */
export async function cancelOrderService(orderId: string, actor?: Actor) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true, shipment: true },
    });

    if (!order) throw new Error("Order not found.");

    if (actor && !actor.isAdmin) {
      if (order.userId !== actor.userId) throw new Error("Order not found.");
      if (order.status !== "PENDING") {
        throw new Error(
          "Only unpaid orders can be cancelled. Please contact support.",
        );
      }
    }

    assertValidOrderStatusTransition(order.status, "CANCELLED");

    const holdsReservation =
      order.status === "PENDING" && order.payment?.status === "PENDING";

    // Lock order: payment first, then order (same order as payment verification)
    if (holdsReservation) {
      const claimed = await tx.payment.updateMany({
        where: { id: order.payment!.id, status: "PENDING" },
        data: { status: "FAILED" },
      });
      if (claimed.count === 0) {
        throw new Error("The payment was just processed. Please try again.");
      }
    }

    const moved = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status: "CANCELLED" },
    });
    if (moved.count === 0) {
      throw new Error("The order was just updated. Please try again.");
    }

    if (holdsReservation) {
      for (const item of order.items) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId, reservedStock: { gte: item.quantity } },
          data: { reservedStock: { decrement: item.quantity } },
        });
      }
    } else if (order.status !== "PENDING") {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // ShipmentStatus has no CANCELLED, so a not-yet-shipped shipment is removed
      if (
        order.shipment &&
        ["PENDING", "PACKING"].includes(order.shipment.status)
      ) {
        await tx.shipment.delete({ where: { id: order.shipment.id } });
      }
    }

    if (order.couponId) await releaseCoupon(tx, order.couponId, order.userId);

    return tx.order.findUniqueOrThrow({ where: { id: orderId } });
  });
}
