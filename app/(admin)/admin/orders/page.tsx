"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetOrdersQuery } from "@/redux/services/orderApi";
import { PageHeader } from "../../components/AdminShell";
import { OrdersTable } from "../../components/orders/order-table";
import { OrderDetails } from "../../components/orders/order-details";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import { useGetOrdersPageQuery } from "@/redux/services/orderApi";
import { AdminPagination } from "../../components/shared/admin-paginaton";

const PAGE_SIZE = 20;

type StatusFilter = "ALL" | OrderStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "همه" },
  { value: "PENDING", label: "درانتظار" },
  { value: "PAID", label: "پرداخت شده" },
  { value: "PROCESSING", label: "درحال پردازش" },
  { value: "SHIPPED", label: "ارسال شده" },
  { value: "DELIVERED", label: "تحویل داده شده" },
  { value: "CANCELLED", label: "لغو شده" },
  { value: "RETURNED", label: "مرجوع شده" },
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetOrdersPageQuery({
      ...(statusFilter !== "ALL" && { status: statusFilter }),
      page,
      pageSize: PAGE_SIZE,
    });

  const orders = data?.items ?? [];

  useEffect(() => {
    if (data && page > data.totalPages) setPage(data.totalPages);
  }, [data, page]);

  return (
    <>
      <PageHeader breadcrumb={[{ href: "/orders", label: "سفارش‌ها" }]} />
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">سفارش‌ها</h1>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">بارگذاری سفارش‌ها</p>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border p-10 text-sm">
            <p className="text-muted-foreground">دریافت سفارش‌ها ناموفق بود.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              تلاش مجدد
            </Button>
          </div>
        ) : (
          <>
            <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
              <OrdersTable
                orders={orders}
                selectedId={selectedOrderId}
                onSelect={setSelectedOrderId}
              />
            </div>

            <AdminPagination
              itemLabel="سفارش"
              page={page}
              totalPages={data?.totalPages ?? 1}
              total={data?.total ?? 0}
              pageSize={PAGE_SIZE}
              disabled={isFetching}
              onPageChange={(p) => {
                setPage(p);
                setSelectedOrderId(null);
              }}
            />
          </>
        )}

        <OrderDetails
          orderId={selectedOrderId}
          open={!!selectedOrderId}
          onOpenChange={(open) => !open && setSelectedOrderId(null)}
        />
      </div>
    </>
  );
}
