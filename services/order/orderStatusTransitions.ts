import { OrderStatus } from "@/lib/generated/prisma/enums";

/**
 * CANCELLED is only reachable before shipping. RETURNED is only reachable
 * after the order has shipped. CANCELLED and RETURNED are terminal.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

export function assertValidOrderStatusTransition(
  current: OrderStatus,
  next: OrderStatus,
) {
  if (current === next) {
    throw new Error(`Order is already ${current}.`);
  }
  if (!ORDER_STATUS_TRANSITIONS[current].includes(next)) {
    throw new Error(`Cannot change order status from ${current} to ${next}.`);
  }
}
