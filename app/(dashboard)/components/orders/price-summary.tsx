import { formatPrice } from "@/lib/utils";

interface PriceSummaryProps {
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalPrice: number;
}

export function PriceSummary({
  subtotal,
  discount,
  shippingFee,
  totalPrice,
}: PriceSummaryProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>جمع کل محصولات</span>
        <span>{formatPrice(subtotal, "تومان")}</span>
      </div>
      {discount > 0 && (
        <div className="flex items-center justify-between text-muted-foreground">
          <span>تخفیف</span>
          <span className="text-destructive">
            -{formatPrice(discount, "تومان")}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between text-muted-foreground">
        <span>هزینه ارسال</span>
        <span>{formatPrice(shippingFee, "تومان")}</span>
      </div>
      <div className="flex items-center justify-between border-t border-border_soft pt-2 text-base font-semibold text-foreground">
        <span>مبلغ قابل پرداخت</span>
        <span>{formatPrice(totalPrice, "تومان")}</span>
      </div>
    </div>
  );
}
