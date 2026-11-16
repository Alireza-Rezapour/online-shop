import type { Order, OrderItem, Prisma } from "@/lib/generated/prisma/client";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import type { z } from "zod";
import type { CreateOrderResult } from "@/services/types";
import type {
  createOrderSchema,
  updateOrderShippingSchema,
} from "./createOrder.schema";
import { Serialized } from "../serialized";

export type GetOrdersParams = {
  status?: OrderStatus;
  userId?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedOrdersDto = {
  items: OrderDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// One include for the list AND the detail, so both always return the same shape
export const orderInclude = {
  items: true,
  payment: true,
  shipment: { include: { carrier: true } },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderDto = Serialized<
  Prisma.OrderGetPayload<{ include: typeof orderInclude }>
>;
// The plain row, returned by status changes and shipping edits
export type OrderRowDto = Serialized<Order>;
export type OrderItemDto = Serialized<OrderItem>;

export type CreateOrderRequest = z.input<typeof createOrderSchema>;
export type UpdateOrderShippingRequest = z.input<
  typeof updateOrderShippingSchema
>;

export type { CreateOrderResult };
