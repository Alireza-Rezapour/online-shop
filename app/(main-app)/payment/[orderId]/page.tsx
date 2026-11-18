// app/(main-app)/payment/[orderId]/page.tsx
import { Suspense } from "react";
import PaymentView from "./payment-view";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">در حال بارگذاری...</div>
      }
    >
      <PaymentView />
    </Suspense>
  );
}
