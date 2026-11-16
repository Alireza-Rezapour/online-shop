"use client";

import { useEffect, useState } from "react";
import { CheckoutStepper } from "./components/cart/CheckoutStepper";
import {
  CheckoutCostSummary,
  emptyOrderDraft,
  OrderDraft,
} from "./types/types";

import Cart from "./components/cart/Cart";
import CheckoutAddressPage from "./components/address/Address";
import { Payment } from "./components/payment/Payment";

export default function ShoppingCartPage() {
  const [summary, setSummary] = useState<CheckoutCostSummary>({
    discount: 0,
    subtotal: 0,
    shippingFee: 0,
    total: 0,
  });
  const [step, setStep] = useState("cart");
  const [orderDraft, setOrderDraft] = useState<OrderDraft>(emptyOrderDraft);

  function updateOrderDraft(patch: Partial<OrderDraft>) {
    setOrderDraft((prev) => ({ ...prev, ...patch }));
  }

  // A refresh on the address or payment step loses this page's state: go back
  useEffect(() => {
    if (step !== "cart" && orderDraft.items.length === 0) setStep("cart");
  }, [step, orderDraft.items.length]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl sm:mb-14">
          <CheckoutStepper setStep={setStep} currentStepId={step} />
        </div>

        {step === "cart" && (
          <Cart
            onChange={updateOrderDraft}
            setStep={setStep}
            setSummary={setSummary}
          />
        )}
        {step === "address" && (
          <CheckoutAddressPage
            summary={summary}
            setSummary={setSummary}
            onChange={updateOrderDraft}
            setStep={setStep}
          />
        )}
        {step === "payment" && (
          <Payment setStep={setStep} order={orderDraft} summary={summary} />
        )}
      </div>
    </main>
  );
}
