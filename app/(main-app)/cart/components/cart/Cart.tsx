"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle } from "lucide-react";

import { CartItemCard } from "./CartItemCard";
import { EmptyCart } from "./EmptyCart";
import { OrderSummary } from "./OrderSummary";
import type { CheckoutCostSummary, OrderDraft } from "../../types/types";
import {
  dismissNotices,
  selectCartHydrated,
  selectCartItems,
  selectCartNotices,
  selectCartTotals,
  selectOrderItems,
  setCartQty,
} from "@/redux/slices/cartSlice";
import { useCartValidation } from "../../hooks/useCartValidation";

const COUPON_ERRORS: Record<string, (min?: number) => string> = {
  INVALID: () => "کد تخفیف معتبر نیست",
  NOT_STARTED: () => "این کد تخفیف هنوز فعال نشده است",
  EXPIRED: () => "مهلت استفاده از این کد تخفیف تمام شده است",
  MIN_ORDER: (min) =>
    `حداقل مبلغ سفارش برای این کد ${(min ?? 0).toLocaleString("fa-IR")} تومان است`,
  ALREADY_USED: () => "شما قبلاً از این کد تخفیف استفاده کرده‌اید",
  LIMIT_REACHED: () => "ظرفیت استفاده از این کد تخفیف تمام شده است",
};

export default function Cart({
  onChange,
  setStep,
  setSummary,
}: {
  onChange: (patch: Partial<OrderDraft>) => void;
  setStep: (step: string) => void;
  setSummary: (summary: CheckoutCostSummary) => void;
}) {
  const dispatch = useDispatch();

  const hydrated = useSelector(selectCartHydrated);
  const items = useSelector(selectCartItems);
  const orderItems = useSelector(selectOrderItems);
  const notices = useSelector(selectCartNotices);
  const { subtotal, saleDiscount } = useSelector(selectCartTotals);

  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const { coupon, couponError, isSyncing, isError } =
    useCartValidation(appliedCode);

  const couponDiscount = coupon?.discount ?? 0;
  const total = Math.max(subtotal - saleDiscount - couponDiscount, 0);

  const unavailable = items.filter((item) => item.availableStock < 1);
  const priceChanged = items.filter((i) =>
    notices.priceChanged.includes(i.variantId),
  );
  const reduced = items.filter((i) => notices.reduced.includes(i.variantId));
  const hasNotices = priceChanged.length > 0 || reduced.length > 0;

  const disabledReason =
    unavailable.length > 0
      ? "ابتدا کالاهای ناموجود را از سبد خرید حذف کنید"
      : null;

  const handleContinue = () => {
    setSummary({
      // Same meaning as Order.subtotal / Order.discount on the server
      subtotal,
      discount: saleDiscount + couponDiscount,
      total,
    });
    onChange({ items: orderItems, couponCode: coupon?.code ?? "" });
    setStep("address");
  };

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
        سبد خرید
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {items.length > 0
          ? `${items.length} محصول در سبد خرید شما`
          : "هیچ محصولی در سبد خرید شما نیست"}
      </p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyCart />
        </div>
      ) : (
        <>
          {(hasNotices || isError) && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1 space-y-1">
                {priceChanged.length > 0 && (
                  <p>
                    قیمت این کالاها تغییر کرده است:{" "}
                    {priceChanged.map((i) => i.title).join("، ")}
                  </p>
                )}
                {reduced.length > 0 && (
                  <p>
                    تعداد این کالاها به موجودی انبار کاهش یافت:{" "}
                    {reduced.map((i) => i.title).join("، ")}
                  </p>
                )}
                {isError && (
                  <p>
                    بررسی موجودی و قیمت انجام نشد. هنگام ثبت سفارش دوباره بررسی
                    می‌شود.
                  </p>
                )}
              </div>
              {hasNotices && (
                <button
                  type="button"
                  className="shrink-0 text-xs underline"
                  onClick={() => dispatch(dismissNotices())}
                >
                  بستن
                </button>
              )}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start lg:gap-10">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <CartItemCard
                  key={item.variantId}
                  item={item}
                  priceChanged={notices.priceChanged.includes(item.variantId)}
                  onQuantityChange={(variantId, quantity) =>
                    dispatch(setCartQty({ variantId, quantity }))
                  }
                />
              ))}
            </div>

            <div className="lg:sticky lg:top-8">
              <OrderSummary
                totals={{
                  subtotal,
                  discount: saleDiscount,
                  couponDiscount,
                  total,
                }}
                appliedCouponCode={coupon?.code ?? null}
                couponError={
                  couponError
                    ? (COUPON_ERRORS[couponError.code]?.(
                        couponError.minOrderAmount,
                      ) ?? "کد تخفیف معتبر نیست")
                    : null
                }
                isSyncing={isSyncing}
                disabledReason={disabledReason}
                onApplyCoupon={setAppliedCode}
                onRemoveCoupon={() => setAppliedCode(null)}
                onContinue={handleContinue}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
