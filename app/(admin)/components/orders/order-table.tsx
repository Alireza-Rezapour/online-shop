"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/app/(dashboard)/data/utils";
import { OrderStatusBadge } from "@/app/(dashboard)/components/shared/order-status-badge";
import type { AdminOrder } from "./types";
import { getCustomerName } from "./order-utils";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

export function OrdersTable({
  orders,
  onSelect,
  selectedId,
}: {
  orders: AdminOrder[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>سفارش</TableHead>
          <TableHead>مشتری</TableHead>
          <TableHead>تاریخ</TableHead>
          <TableHead>مجموع</TableHead>
          <TableHead>پرداخت</TableHead>
          <TableHead>ارسال</TableHead>
          <TableHead>وضعیت</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          // Paid and waiting for the warehouse: the admin has something to do
          const needsShipment =
            !order.shipment &&
            (order.status === "PAID" || order.status === "PROCESSING");

          return (
            <TableRow
              key={order.id}
              onClick={() => onSelect(order.id)}
              className={`cursor-pointer ${selectedId === order.id ? "bg-muted" : ""}`}
            >
              <TableCell className="font-mono text-xs">
                {order.orderNumber}
              </TableCell>
              <TableCell>{getCustomerName(order.user)}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>{formatPrice(order.totalPrice, "تومان")}</TableCell>
              <TableCell>
                {order.payment ? (
                  <StatusBadge status={order.payment.status} kind="payment" />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {order.shipment ? (
                  <StatusBadge status={order.shipment.status} kind="shipment" />
                ) : needsShipment ? (
                  <span className="text-xs text-amber-600">ثبت نشده</span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          );
        })}
        {orders.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground"
            >
              سفارشی پیدا نشد
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
