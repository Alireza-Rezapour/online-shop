"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminUserOrdersQuery } from "@/redux/services/adminUserApi";
import { formatPrice } from "@/lib/utils";

// extend with your real OrderStatus values; unknown ones fall back to the raw value
const STATUS_LABEL: Record<string, string> = {
  PENDING: "در انتظار",
  PAID: "پرداخت شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  FAILED: "ناموفق",
  CANCELLED: "لغو شده",
  REFUNDED: "بازگشت وجه",
};

export function OrdersTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminUserOrdersQuery({
    id: userId,
    page,
    pageSize: 10,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!data || data.data.length === 0)
    return (
      <p className="py-10 text-center text-sm text-[#6B5D4F]">
        سفارشی ثبت نشده است
      </p>
    );

  console.log(data.data);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>شناسه</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>تعداد اقلام</TableHead>
            <TableHead>کوپن</TableHead>
            <TableHead>مبلغ کل</TableHead>
            <TableHead>تاریخ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                {order.id.slice(0, 8)}
              </TableCell>
              <TableCell>
                {STATUS_LABEL[order.status] ?? order.status}
              </TableCell>
              <TableCell>{order._count.items}</TableCell>
              <TableCell dir="ltr" className="font-mono text-xs">
                {order.couponCode ?? "—"}
              </TableCell>
              <TableCell>{formatPrice(+order.totalPrice, "تومان")}</TableCell>
              <TableCell className="text-sm text-[#6B5D4F]">
                {new Date(order.createdAt).toLocaleDateString("fa-IR")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= data.meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}
