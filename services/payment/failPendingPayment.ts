import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Marks a PENDING payment FAILED and releases its stock reservation.
 * Idempotent: the PENDING -> FAILED switch is claimed atomically, and the
 * reservation is only released by the caller that wins it. Returns false when
 * the payment was already resolved, so a reservation is never released twice.
 */
export async function failPendingPaymentTx(
  tx: Prisma.TransactionClient,
  paymentId: string,
): Promise<boolean> {
  const claimed = await tx.payment.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "FAILED" },
  });
  if (claimed.count === 0) return false;

  const items = await tx.orderItem.findMany({
    where: { order: { payment: { id: paymentId } } },
    select: { variantId: true, quantity: true },
  });

  for (const item of items) {
    await tx.productVariant.updateMany({
      where: { id: item.variantId, reservedStock: { gte: item.quantity } },
      data: { reservedStock: { decrement: item.quantity } },
    });
  }
  return true;
}

export function failPendingPayment(paymentId: string): Promise<boolean> {
  return prisma.$transaction((tx) => failPendingPaymentTx(tx, paymentId));
}
