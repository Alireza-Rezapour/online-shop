import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

/**
 * Only one payment method exists today. When more methods are added,
 * turn this into a selectable list driven by a `paymentMethods` array
 * and lift the selected id into local/Redux state.
 */
export function PaymentMethodCard() {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">روش پرداخت</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-xl border-2 border-primary/60 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">زرین‌پال</p>
            </div>
          </div>
          <Badge className="rounded-full px-3 py-1 bg-primary-foreground text-secondary">
            انتخاب شده
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
