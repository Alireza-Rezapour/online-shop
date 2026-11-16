import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { OrderStatusBadge } from "../shared/order-status-badge";
import { formatDate } from "../../data/utils";
import { formatPrice } from "@/lib/utils";
import { OrderDto } from "@/services/order/order.dto";

export function RecentOrdersTable({ orders }: { orders: OrderDto[] }) {
  const recent = orders.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>سفارش های اخیر</CardTitle>
        <Link
          href="/orders"
          className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
        >
          مشاهده همه <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border_soft text-center text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-3 pr-4 font-medium text-center">کد سفارش</th>
                <th className="py-3 pr-4 font-medium text-center">تاریخ</th>
                <th className="py-3 pr-4 font-medium text-center">وضعیت</th>
                <th className="py-3 pr-4 font-medium text-center">مجموع</th>
                <th className="py-3 pr-0 font-medium text-center">جزییات</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => {
                return (
                  <tr
                    key={order.id}
                    className="border-b border-border_soft last:border-0 transition-colors hover:bg-primary-50/40 text-center"
                  >
                    <td className="py-3.5 pr-4 font-medium text-foreground text-center">
                      {order.id}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground text-center">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="py-3.5 pr-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 pr-4 font-medium text-foreground text-center">
                      {formatPrice(order.totalPrice, "تومان")}
                    </td>
                    <td className="py-3.5 pr-0 text-center">
                      <Link
                        href={`/orders/${order.id}`}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-50"
                      >
                        مشاهده جزییات
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {recent.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-border_soft p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {order.id}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {formatDate(order.createdAt)} · {order.items.length} items
                </span>
                <span className="font-medium text-foreground">
                  {order.totalPrice}
                </span>
              </div>
              <Link
                href="/orders"
                className="mt-3 block rounded-lg bg-primary-50 py-2 text-center text-xs font-medium text-primary"
              >
                مشاهده جزییات
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
