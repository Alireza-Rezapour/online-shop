"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SuccessToast from "@/lib/toast/success-toast";
import { useDeleteCouponMutation } from "@/redux/services/couponApi";
import type { CouponDto } from "@/services/coupon/coupon.schema";
import { getApiError } from "./coupon-helpers";
import ErrorToast from "@/lib/toast/error-toast";

interface DeleteCouponDialogProps {
  coupon: CouponDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCouponDialog({
  coupon,
  open,
  onOpenChange,
}: DeleteCouponDialogProps) {
  const [deleteCoupon, { isLoading }] = useDeleteCouponMutation();

  const handleDelete = async () => {
    if (!coupon) return;
    try {
      await deleteCoupon(coupon.id).unwrap();
      SuccessToast("کد تخفیف حذف شد");
      onOpenChange(false);
    } catch (err) {
      ErrorToast(getApiError(err, "حذف کد تخفیف ناموفق بود"));
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader className="text-right">
          <AlertDialogTitle>حذف کد تخفیف</AlertDialogTitle>
          <AlertDialogDescription>
            کد{" "}
            <span dir="ltr" className="font-mono font-medium">
              {coupon?.code}
            </span>{" "}
            برای همیشه حذف می‌شود. اگر از این کد استفاده شده باشد، به‌جای حذف آن
            را غیرفعال کنید.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
          <AlertDialogAction
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? "در حال حذف..." : "حذف"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isLoading}>انصراف</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
