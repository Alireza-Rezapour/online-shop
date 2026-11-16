import { Package, Clock3, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Order } from "../../types";
import { OrderDto } from "@/services/order/order.dto";

export function StatsGrid({ orders }: { orders: OrderDto[] }) {
  const pendingOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "PAID" ||
      order.status === "PROCESSING" ||
      order.status === "SHIPPED",
  );
  const completedOrders = orders.filter(
    (order) => order.status === "DELIVERED",
  );

  const cards = [
    {
      label: "مجموع سفارش ها",
      value: orders.length,
      description: "تمام سفارش هایی که تاکنون ثبت شده",
      icon: Package,
    },
    {
      label: "سفارش های در حال پردازش",
      value: pendingOrders.length,
      description: "سفارش هایی که هم‌اکنون در مرحله پردازش قرار دارد",
      icon: Clock3,
    },
    {
      label: "سفارش هایی تکمیل شده",
      value: completedOrders.length,
      description: "سفارش هایی که با موفقیت تحویل داده شده",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={cn(
            "group rounded-2xl border border-border_soft bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors duration-300 group-hover:bg-primary-foreground group-hover:text-white">
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-medium text-foreground">
            {card.value}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground/80">
            {card.label}
          </p>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
