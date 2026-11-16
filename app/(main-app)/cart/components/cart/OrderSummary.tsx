"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { OrderTotals } from "../../types/types";
import { formatPrice } from "@/lib/utils";

interface OrderSummaryProps {
  totals: OrderTotals;
  appliedCouponCode: string | null;
  couponError: string | null;
  isSyncing: boolean;
  disabledReason: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  onContinue: () => void;
}

export function OrderSummary({
  totals,
  appliedCouponCode,
  couponError,
  isSyncing,
  disabledReason,
  onApplyCoupon,
  onRemoveCoupon,
  onContinue,
}: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");

  const handleApply = () => {
    if (couponCode.trim()) onApplyCoupon(couponCode.trim());
  };

  const Row = ({
    label,
    value,
    highlight,
  }: {
    label: string;
    value: number;
    highlight?: boolean;
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span
        className={
          highlight && value > 0
            ? "font-medium text-[#68578b]"
            : "font-medium text-neutral-900"
        }
      >
        {formatPrice(value, "تومان")}
        {highlight && value > 0 ? "−" : ""}
      </span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] sm:p-7">
      <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
        خلاصه سفارش
      </h2>

      <div className="mt-5 space-y-3 text-sm">
        <Row label="مجموع" value={totals.subtotal} />
        <Row label="تخفیف" value={totals.discount} highlight />
        <Row label="کد تخفیف" value={totals.couponDiscount} highlight />
      </div>

      {/* Coupon */}
      <div className="mt-5">
        <label
          htmlFor="coupon"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500"
        >
          کد تخفیف
        </label>

        {appliedCouponCode ? (
          <div className="flex items-center justify-between rounded-full border border-[#68578b]/30 bg-[#68578b]/5 px-4 py-2 text-sm">
            <span dir="ltr" className="font-medium text-[#68578b]">
              {appliedCouponCode}
            </span>
            <button
              type="button"
              onClick={onRemoveCoupon}
              aria-label="حذف کد تخفیف"
              className="text-neutral-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                id="coupon"
                placeholder="کد تخفیف را وارد کنید"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                className="rounded-full border-neutral-200 pl-9 text-sm focus-visible:ring-[#68578b]"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleApply}
              className="shrink-0 rounded-full border-neutral-200 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:border-[#68578b] hover:text-[#68578b]"
            >
              اعمال
            </Button>
          </div>
        )}

        {appliedCouponCode && !couponError && totals.couponDiscount > 0 && (
          <p className="mt-2 text-xs font-medium text-[#68578b]">
            کد تخفیف با موفقیت اعمال شد
          </p>
        )}
        {couponError && (
          <p className="mt-2 text-xs font-medium text-red-500">{couponError}</p>
        )}
      </div>

      <Separator className="my-5 bg-neutral-200" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-900 sm:text-base">
          مجموع کل
        </span>
        <span className="text-lg font-semibold text-neutral-900 sm:text-xl">
          {formatPrice(totals.total, "تومان")}
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-400">
        هزینه ارسال در مرحله بعد محاسبه می‌شود.
      </p>

      {disabledReason && (
        <p className="mt-4 text-xs text-red-500">{disabledReason}</p>
      )}

      <Button
        type="button"
        onClick={onContinue}
        disabled={isSyncing || !!disabledReason}
        className="mt-6"
      >
        {isSyncing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            در حال بررسی...
          </>
        ) : (
          <>
            انتخاب آدرس
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
