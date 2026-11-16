import { randomUUID } from "crypto";

import type { VerifyPaymentInput, VerifyPaymentResult } from "../types";
import prisma from "@/lib/prisma";
import { failPendingPayment } from "./failPendingPayment";

type Actor = { userId: string; isAdmin: boolean };

function isTestGatewayBlocked() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_TEST_PAYMENTS !== "true"
  );
}

/**
 * Applies a (TEST) gateway result to Payment and Order atomically.
 *
 * - success: Payment -> SUCCESS (+ paidAt, refId), Order -> PAID, stock and
 *   reservedStock both decrement.
 * - failure: Payment -> FAILED, Order stays PENDING, reservation released.
 * - unexpected error while processing: the transaction rolls back, then the
 *   payment is failed and its reservation released, exactly once.
 *
 * `actor` is the logged-in user calling through the API. A real gateway
 * callback has no session: it calls this without `actor` after verifying the
 * gateway's own response.
 */
export async function verifyPaymentService(
  input: VerifyPaymentInput & { actor?: Actor },
): Promise<VerifyPaymentResult> {
  const { paymentId, success, actor } = input;

  // Phase 1: preconditions. Failing here must not touch the payment or its
  // reservation, otherwise anyone could fail someone else's payment.
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { select: { id: true, userId: true, status: true } } },
  });

  if (!payment) throw new Error(`Payment not found: ${paymentId}`);

  if (actor && !actor.isAdmin && payment.order.userId !== actor.userId) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  if (payment.gateway === "TEST" && isTestGatewayBlocked()) {
    throw new Error("The TEST payment gateway is disabled in production.");
  }

  if (payment.status !== "PENDING") {
    throw new Error(
      `Payment ${paymentId} has already been resolved with status "${payment.status}".`,
    );
  }

  if (payment.order.status !== "PENDING") {
    throw new Error(
      `Order is ${payment.order.status}; its payment can no longer be processed.`,
    );
  }

  // Phase 2: processing
  try {
    return await prisma.$transaction(async (tx) => {
      // Claim the payment atomically so two simultaneous calls cannot both win
      const claimed = await tx.payment.updateMany({
        where: { id: paymentId, status: "PENDING" },
        data: success
          ? {
              status: "SUCCESS",
              paidAt: new Date(),
              refId: generateFakeRefId(),
            }
          : { status: "FAILED" },
      });
      if (claimed.count === 0) {
        throw new Error(`Payment ${paymentId} has already been resolved.`);
      }

      const order = await tx.order.findUniqueOrThrow({
        where: { id: payment.orderId },
        include: { items: true },
      });

      if (success) {
        const paid = await tx.order.updateMany({
          where: { id: order.id, status: "PENDING" },
          data: { status: "PAID" },
        });
        if (paid.count === 0) {
          throw new Error("The order is no longer waiting for payment.");
        }

        // Fulfil the reservation: units leave stock and reservedStock together
        for (const item of order.items) {
          const result = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
              reservedStock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
              reservedStock: { decrement: item.quantity },
            },
          });

          if (result.count === 0) {
            throw new Error(
              `Insufficient stock for variant ${item.variantId}.`,
            );
          }
        }
      } else {
        for (const item of order.items) {
          await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              reservedStock: { gte: item.quantity },
            },
            data: { reservedStock: { decrement: item.quantity } },
          });
        }
      }

      return {
        paymentId,
        orderId: order.id,
        status: success ? ("SUCCESS" as const) : ("FAILED" as const),
      };
    });
  } catch (err) {
    // The transaction rolled back, so the payment is PENDING again but its
    // reservation (made earlier, in createPaymentService) is still held.
    // failPendingPayment fails the payment and releases that reservation once;
    // if the payment was already resolved it does nothing.
    try {
      await failPendingPayment(paymentId);
    } catch (cleanupError) {
      console.error(
        `Could not release the reservation of payment ${paymentId}`,
        cleanupError,
      );
    }
    throw err;
  }
}

// Replace with the real gateway's reference id when it is wired up
function generateFakeRefId(): string {
  return `TEST-${randomUUID()}`;
}
