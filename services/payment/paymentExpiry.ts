import prisma from "@/lib/prisma";
import { failPendingPayment } from "./failPendingPayment";

export const PAYMENT_TTL_MINUTES = 20;
export const PAYMENT_TTL_MS = PAYMENT_TTL_MINUTES * 60 * 1000;

/**
 * Releases the reservation of every payment that has been PENDING longer than
 * the TTL and marks it FAILED, so the order can start a new payment.
 * Call it from a scheduler every few minutes.
 */
export async function expireStalePaymentsService(now = new Date()) {
  const cutoff = new Date(now.getTime() - PAYMENT_TTL_MS);

  const stale = await prisma.payment.findMany({
    where: { status: "PENDING", createdAt: { lt: cutoff } },
    select: { id: true },
    take: 200,
  });

  let expired = 0;
  for (const { id } of stale) {
    if (await failPendingPayment(id)) expired++;
  }
  return { expired };
}
