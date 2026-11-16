import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function PaymentNotice() {
  return (
    <Alert className="rounded-2xl border-muted-foreground/20 bg-muted/40">
      <Info className="h-4 w-4" />
      <AlertTitle>Before you continue</AlertTitle>
      <AlertDescription>
        Clicking &ldquo;Pay Now&rdquo; will create your order and redirect you
        to the payment gateway to complete your purchase.
      </AlertDescription>
    </Alert>
  );
}
