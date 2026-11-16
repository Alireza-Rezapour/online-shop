import { formatPrice } from "@/lib/utils";
import { OrderItem } from "../../types";

export function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-xs text-muted-foreground">
          تصویر
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {item.productTitle}
          </p>
          <p className="text-xs text-muted-foreground">
            رنگ: {item.colorName} · سایز: {item.sizeName} · کد: {item.sku}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-left">
        <div className="text-xs text-muted-foreground">
          {item.quantity} × {formatPrice(item.salePrice, "تومان")}
        </div>
        <p className="text-sm font-semibold text-foreground">
          {formatPrice(item.lineTotal, "تومان")}
        </p>
      </div>
    </div>
  );
}
