import prisma from "@/lib/prisma";
import type { CreatePaymentInput, CreatePaymentResult } from "../types";
import { failPendingPaymentTx } from "./failPendingPayment";
import { PAYMENT_TTL_MS } from "./paymentExpiry";

const PAYMENT_GATEWAY = "TEST";

/**
 * Starts (or restarts) the payment of a PENDING order and reserves its stock.
 * Payment.orderId is unique, so an order has exactly one Payment row:
 * - no payment yet            -> create it
 * - PENDING and still fresh   -> return it (double click / page reload)
 * - PENDING but past the TTL  -> release the old reservation, then restart it
 * - FAILED                    -> restart the same row (retry)
 * - SUCCESS / REFUNDED        -> refuse
 */
export async function createPaymentService(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const { orderId, userId } = input;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { payment: true, items: true },
    });

    // A foreign order looks exactly like a missing one
    if (!order || order.userId !== userId) {
      throw new Error("Order not found.");
    }

    if (order.status !== "PENDING") {
      throw new Error(
        `Cannot create a payment for order ${orderId}: order status is "${order.status}", expected "PENDING".`,
      );
    }

    let payment: CreatePaymentResult;
    const existing = order.payment;

    if (existing) {
      if (existing.status === "PENDING") {
        const expired =
          Date.now() - existing.createdAt.getTime() > PAYMENT_TTL_MS;
        if (!expired) {
          return {
            paymentId: existing.id,
            orderId: order.id,
            amount: existing.amount,
          };
        }
        await failPendingPaymentTx(tx, existing.id);
      } else if (existing.status !== "FAILED") {
        throw new Error(
          `Order ${orderId} already has a ${existing.status} payment.`,
        );
      }

      // createdAt is reset on purpose: it marks the start of this reservation
      const restarted = await tx.payment.updateMany({
        where: { id: existing.id, status: "FAILED" },
        data: {
          status: "PENDING",
          amount: order.totalPrice,
          gateway: PAYMENT_GATEWAY,
          authority: null,
          refId: null,
          paidAt: null,
          createdAt: new Date(),
        },
      });
      if (restarted.count === 0) {
        throw new Error("The payment was just updated. Please try again.");
      }
      payment = {
        paymentId: existing.id,
        orderId: order.id,
        amount: order.totalPrice,
      };
    } else {
      const created = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalPrice,
          gateway: PAYMENT_GATEWAY,
          status: "PENDING",
        },
        select: { id: true, orderId: true, amount: true },
      });
      payment = {
        paymentId: created.id,
        orderId: created.orderId,
        amount: created.amount,
      };
    }

    // Reserve stock. The check-and-increment is one atomic statement per row;
    // it compares two columns, which updateMany cannot express, hence raw SQL.
    for (const item of order.items) {
      const updatedRows = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "reservedStock" = "reservedStock" + ${item.quantity}
        WHERE id = ${item.variantId}
          AND stock - "reservedStock" >= ${item.quantity}
      `;

      if (updatedRows === 0) {
        throw new Error(
          `Insufficient available stock for variant ${item.variantId}.`,
        );
      }
    }

    return payment;
  });
}
