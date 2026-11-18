"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOrderQuery } from "@/redux/services/orderApi";
import {
  useCreatePaymentMutation,
  useGetPaymentByOrderQuery,
  useUpdatePaymentStatusMutation,
} from "@/redux/services/paymentApi";
import { removeAll } from "@/redux/slices/cartSlice";
import { useDispatch } from "react-redux";
import { formatPrice } from "@/lib/utils";

/**
 * Dev/testing-only payment page.
 *
 * This stands in for the real payment gateway (e.g. ZarinPal) until that
 * integration is built. It does NOT call any backend/payment API.
 */
export default function PaymentView() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const dispatch = useDispatch();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: order, isLoading } = useGetOrderQuery(orderId);
  const { data: payment, isLoading: paymentLoading } =
    useGetPaymentByOrderQuery(orderId);

  const [confirmPayment] = useUpdatePaymentStatusMutation();

  if (isLoading || paymentLoading) {
    return <Skeleton />;
  }

  // TODO:
  // Call the payment mutation here after the payment API is implemented.
  // e.g. const [confirmPayment] = useConfirmPaymentMutation();

  const handleOutcome = (outcome: "SUCCESS" | "FAILED") => {
    setIsRedirecting(true);

    if (outcome === "SUCCESS") {
      dispatch(removeAll());
    } else {
    }

    // TODO:
    // Call the payment mutation here after the payment API is implemented,
    // then route based on the real gateway callback instead of this
    // simulated button click.
    confirmPayment({ status: outcome, id: payment?.id! });
    setTimeout(() => {
      router.push(`/payment/${orderId}/${outcome}`);
    }, 700);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-6 px-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="items-center text-center">
          <Badge
            variant="secondary"
            className="mb-2 gap-1 rounded-full px-3 py-1"
          >
            <Clock className="h-3.5 w-3.5" />
            درحال بارگذاری
          </Badge>
          <CardTitle className="text-xl">فرآیند پرداخت</CardTitle>
          <CardDescription>سفارش #{orderId}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">مبلغ کل</p>
            <p className="text-2xl font-semibold mt-2">
              {formatPrice(order?.totalPrice!, "تومان")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            {isRedirecting ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <Skeleton className="h-10 w-10 rounded-full" />
            )}
            <p className="text-sm text-muted-foreground">
              {isRedirecting ? "انتقال به درگاه..." : "انتظار برای درگاه..."}
            </p>
          </div>

          <Separator />

          <div className="w-full space-y-3">
            <p className="text-center text-xs text-muted-foreground">
              Development only — simulate a gateway response
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                disabled={isRedirecting}
                onClick={() => handleOutcome("SUCCESS")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Successful Payment
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                disabled={isRedirecting}
                onClick={() => handleOutcome("FAILED")}
              >
                <XCircle className="h-4 w-4" />
                Failed Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
