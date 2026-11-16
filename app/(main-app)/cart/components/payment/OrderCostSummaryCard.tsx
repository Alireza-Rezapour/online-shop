import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Receipt } from "lucide-react";
import { CheckoutCostSummary } from "../../types/types";
import { formatPrice } from "@/lib/utils";

interface OrderCostSummaryCardProps {
  summary: CheckoutCostSummary;
}

export function OrderCostSummaryCard({ summary }: OrderCostSummaryCardProps) {
  const { subtotal, shippingFee, discount, total } = summary;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <Receipt className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base font-medium">خلاصه سفارش</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">مجموع</span>
          <span className="font-medium">{formatPrice(subtotal!, "تومان")}</span>
        </div>
        {shippingFee !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">هزینه ارسال</span>
            <span className="font-medium">
              {shippingFee > 0 ? formatPrice(shippingFee, "تومان") : "رایگان"}
            </span>
          </div>
        )}

        {!!discount && discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">تخفیف</span>
            <span className="font-medium text-emerald-600">
              {formatPrice(discount, "تومان")}
            </span>
          </div>
        )}

        <Separator className="my-1" />

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">هزینه نهایی</span>
          <span className="text-lg font-semibold">
            {formatPrice(total!, "تومان")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
