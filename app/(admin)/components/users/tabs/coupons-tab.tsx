// components/admin/users/tabs/coupons-tab.tsx
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
import { useGetAdminUserCouponsQuery } from "@/redux/services/adminUserApi";

export function CouponsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminUserCouponsQuery({
    id: userId,
    page,
    pageSize: 10,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!data || data.data.length === 0)
    return (
      <p className="py-10 text-center text-sm text-[#6B5D4F]">
        کوپنی ثبت نشده است
      </p>
    );

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>کد</TableHead>
            <TableHead>نوع</TableHead>
            <TableHead>مقدار</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>انقضا</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((cu) => (
            <TableRow key={cu.couponId}>
              <TableCell dir="ltr" className="font-mono text-xs">
                {cu.coupon.code}
              </TableCell>
              <TableCell>
                {cu.coupon.type === "PERCENTAGE" ? "درصدی" : "مبلغ ثابت"}
              </TableCell>
              <TableCell>
                {cu.coupon.type === "PERCENTAGE"
                  ? `${cu.coupon.value}%`
                  : `${Number(cu.coupon.value).toLocaleString("fa-IR")} تومان`}
              </TableCell>
              <TableCell>{cu.coupon.isActive ? "فعال" : "غیرفعال"}</TableCell>
              <TableCell className="text-sm text-[#6B5D4F]">
                {cu.coupon.expiresAt
                  ? new Date(cu.coupon.expiresAt).toLocaleDateString("fa-IR")
                  : "بدون انقضا"}
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
