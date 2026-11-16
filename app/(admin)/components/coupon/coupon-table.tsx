"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { useUpdateCouponMutation } from "@/redux/services/couponApi";
import type { CouponDto } from "@/services/coupon/coupon.schema";
import SuccessToast from "@/lib/toast/success-toast";
import {
  formatCouponValue,
  formatFaDate,
  getApiError,
  STATUS_META,
} from "./coupon-helpers";
import ErrorToast from "@/lib/toast/error-toast";
import { DeleteCouponDialog } from "./delete-coupon-dialog";

interface CouponTableProps {
  coupons: CouponDto[];
  onEdit: (coupon: CouponDto) => void;
}

export function CouponTable({ coupons, onEdit }: CouponTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<CouponDto | null>(null);
  const [updateCoupon] = useUpdateCouponMutation();

  const handleToggleActive = async (coupon: CouponDto) => {
    try {
      await updateCoupon({
        id: coupon.id,
        data: { isActive: !coupon.isActive },
      }).unwrap();
      SuccessToast(
        coupon.isActive ? "کد تخفیف غیرفعال شد" : "کد تخفیف فعال شد",
      );
    } catch (err) {
      ErrorToast(getApiError(err, "تغییر وضعیت ناموفق بود"));
    }
  };

  if (coupons.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        هیچ کد تخفیفی یافت نشد
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کد</TableHead>
              <TableHead>تخفیف</TableHead>
              <TableHead>حداقل سفارش</TableHead>
              <TableHead>استفاده</TableHead>
              <TableHead>اعتبار</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>فعال</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => {
              const status = STATUS_META[coupon.status];
              return (
                <TableRow key={coupon.id}>
                  <TableCell
                    dir="ltr"
                    className="text-right font-mono font-medium"
                  >
                    {coupon.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {coupon.type === "PERCENTAGE" ? "درصدی" : "مبلغ ثابت"}
                      </Badge>
                      <span>{formatCouponValue(coupon)}</span>
                    </div>
                    {coupon.type === "PERCENTAGE" &&
                      coupon.maxDiscount !== null && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          سقف: {formatPrice(coupon.maxDiscount, "تومان")}
                        </p>
                      )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.minOrderAmount !== null
                      ? formatPrice(coupon.minOrderAmount, "تومان")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.usedCount.toLocaleString("fa-IR")}
                    {coupon.usageLimit !== null
                      ? ` / ${coupon.usageLimit.toLocaleString("fa-IR")}`
                      : ""}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>از: {formatFaDate(coupon.startsAt)}</div>
                    <div>
                      تا:{" "}
                      {coupon.expiresAt
                        ? formatFaDate(coupon.expiresAt)
                        : "بدون انقضا"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.isActive}
                      onCheckedChange={() => handleToggleActive(coupon)}
                    />
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEdit(coupon)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          ویرایش
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(coupon)}
                          className="gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DeleteCouponDialog
        coupon={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </>
  );
}
