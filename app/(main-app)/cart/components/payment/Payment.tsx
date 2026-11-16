"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { OrderCostSummaryCard } from "./OrderCostSummaryCard";
import { PaymentMethodCard } from "./PaymentMethodCard";
import {
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} from "@/redux/services/orderApi";
import { useCreatePaymentMutation } from "@/redux/services/paymentApi";
import { removeAll } from "@/redux/slices/cartSlice";
import { CheckoutCostSummary, OrderDraft } from "../../types/types";

function getApiError(err: unknown): string {
  const data = (err as { data?: { error?: string; message?: string } })?.data;
  return (
    data?.error ??
    data?.message ??
    "ثبت سفارش ناموفق بود. اطلاعات خود را بررسی کنید و دوباره تلاش کنید."
  );
}

export function Payment({
  summary,
  order,
  setStep,
}: {
  summary: CheckoutCostSummary;
  setStep: (step: string) => void;
  order: OrderDraft;
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [createOrder, { isLoading: orderCreating }] = useCreateOrderMutation();
  const [createPayment, { isLoading: paymentCreating }] =
    useCreatePaymentMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const [redirecting, setRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = orderCreating || paymentCreating || redirecting;

  const handlePayNow = async () => {
    setErrorMessage(null);
    let orderId: string | null = null;

    try {
      const created = await createOrder({
        items: order.items,
        shippingReceiverName: order.shippingReceiverName,
        shippingPhone: order.shippingPhone,
        shippingProvince: order.shippingProvince,
        shippingCity: order.shippingCity,
        shippingAddress: order.shippingAddress,
        shippingPostalCode: order.shippingPostalCode,
        shippingCarrierId: order.shippingCarrierId,
        couponCode: order.couponCode || undefined,
      }).unwrap();
      orderId = created.orderId;

      // Reserves the stock. This is the step that can fail on a last-second sell-out.
      await createPayment({ orderId }).unwrap();

      // The order is paid for from here on, so the cart is done
      dispatch(removeAll());
      setRedirecting(true);
      router.push(`/payment/${orderId}`);
    } catch (err) {
      // The order exists but cannot be paid: cancel it so it does not linger
      // (this also gives a used coupon back). Best effort, the error is shown either way.
      if (orderId) {
        try {
          await updateOrderStatus({
            id: orderId,
            status: "CANCELLED",
          }).unwrap();
        } catch {}
      }
      setErrorMessage(getApiError(err));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">پرداخت</h2>
        <button onClick={() => setStep("cart")}>بازگشت به سبد خرید</button>
      </div>

      <OrderCostSummaryCard summary={summary} />

      <PaymentMethodCard />

      {errorMessage && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>ثبت سفارش ناموفق بود</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        size="lg"
        className="w-full rounded-xl py-6 text-base font-medium shadow-sm"
        onClick={handlePayNow}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ...
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-5 w-5" />
            پرداخت
          </>
        )}
      </Button>
    </div>
  );
}
