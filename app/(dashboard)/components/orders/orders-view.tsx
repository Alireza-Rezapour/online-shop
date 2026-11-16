"use client";

import { useMemo, useState } from "react";
import { Search, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { OrderCard } from "./order-card";
import { useGetOrdersQuery } from "@/redux/services/orderApi";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "../shared/state-views";
import { OrderStatus } from "@/lib/generated/prisma/client";
import Loading from "@/app/components/shared/loading";

const dateOptions = [
  { value: "all", label: "همه" },
  { value: "30", label: "30 روز اخیر" },
  { value: "90", label: "90 روز اخیر" },
];

const statusOptions: { value: OrderStatus | "All"; label: string }[] = [
  {
    value: "CANCELLED",
    label: "کنسل شده",
  },
  {
    value: "PENDING",
    label: "پرداخت نشده",
  },
  {
    value: "DELIVERED",
    label: "تحویل داده شده",
  },
  {
    value: "PAID",
    label: "پرداخت شده",
  },
  {
    value: "PROCESSING",
    label: "درحال پردازش",
  },
  {
    value: "RETURNED",
    label: "مرجوع شده",
  },
  {
    value: "SHIPPED",
    label: "ارسال شده",
  },
  {
    value: "All",
    label: "همه",
  },
];

export function OrdersView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const [dateRange, setDateRange] = useState("all");

  const { data: session } = authClient.useSession();

  const { data: orders, isLoading: ordersLoading } = useGetOrdersQuery({
    userId: session?.user.id,
  });

  if (ordersLoading) return <Loading />;

  const filtered = useMemo(() => {
    const now = new Date();
    if (!orders) return [];
    return orders?.filter((order) => {
      const matchesQuery = order.orderNumber
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = status === "All" || order.status === status;
      const days = dateRange === "all" ? Infinity : Number(dateRange);
      const orderDate = new Date(order.createdAt);
      const withinRange =
        (now.getTime() - orderDate.getTime()) / 86400000 <= days;
      return matchesQuery && matchesStatus && withinRange;
    });
  }, [query, status, dateRange, orders]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی سفارش با کد..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as OrderStatus | "All")}
          >
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {!ordersLoading ? (
        filtered?.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="هیچ سفارشی پیدا نشد"
            description="فیلتر را عوض کنید یا سفارش سبد کنید"
          />
        ) : (
          <div className="space-y-4">
            {filtered?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <Skeleton className="rounded-2xl border border-border_soft bg-white p-5 shadow-soft transition-shadow hover:shadow-hover" />
        </div>
      )}
    </div>
  );
}
