import type { OrderDto } from "@/services/order/order.dto";

export type AdminOrder = OrderDto;
export type AdminOrderItem = OrderDto["items"][number];
export type AdminOrderUser = OrderDto["user"];
export type AdminPayment = NonNullable<OrderDto["payment"]>;
export type ShipmentInfo = NonNullable<OrderDto["shipment"]>;
