"use client";

import { use } from "react";
import { ArrowRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetOrderQuery } from "@/redux/services/orderApi";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { formatDate } from "@/app/(dashboard)/data/utils";

export default function OrderBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, isError } = useGetOrderQuery(id);

  if (isLoading) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        در حال بارگذاری...
      </p>
    );
  }

  if (isError || !order) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        سفارش یافت نشد.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex justify-between print:hidden">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> چاپ صورت‌حساب
        </Button>
      </div>

      <div className="rounded-2xl border border-border_soft bg-white p-8 shadow-soft print:border-0 print:shadow-none">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-border_soft pb-4">
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              صورت‌حساب
            </p>
            <p className="text-xs text-muted-foreground">
              شماره سفارش: {order.id}
            </p>
          </div>
          <div className="text-left text-xs text-muted-foreground">
            <p>تاریخ صدور: {formatDate(order.createdAt)}</p>
            <p>وضعیت: {order.status}</p>
          </div>
        </div>

        {/* Buyer / shipping info */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">مشخصات خریدار</p>
            <p className="font-medium text-foreground">
              {order.shippingReceiverName}
            </p>
            <p className="text-muted-foreground">{order.shippingPhone}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">آدرس ارسال</p>
            <p className="text-foreground">
              {order.shippingProvince}، {order.shippingCity}
            </p>
            <p className="text-muted-foreground">{order.shippingAddress}</p>
            <p className="text-muted-foreground">
              کد پستی: {order.shippingPostalCode}
            </p>
          </div>
        </div>

        {/* Items table */}
        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border_soft text-xs text-muted-foreground">
              <th className="py-2 text-right font-medium">کالا</th>
              <th className="py-2 text-right font-medium">تعداد</th>
              <th className="py-2 text-right font-medium">قیمت واحد</th>
              <th className="py-2 text-left font-medium">جمع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border_soft">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2">
                  <p className="font-medium text-foreground">
                    {item.productTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.colorName} · {item.sizeName} · {item.sku}
                  </p>
                </td>
                <td className="py-2 text-muted-foreground">{item.quantity}</td>
                <td className="py-2 text-muted-foreground">
                  {formatPrice(item.salePrice || 0, "تومان")}
                </td>
                <td className="py-2 text-left font-medium text-foreground">
                  {formatPrice(item.lineTotal, "تومان")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>جمع کل محصولات</span>
            <span>{formatPrice(order.subtotal, "تومان")}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>تخفیف</span>
              <span>-{formatPrice(order.discount, "تومان")}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-muted-foreground">
            <span>هزینه ارسال</span>
            <span>{formatPrice(order.shippingFee, "تومان")}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border_soft pt-2 text-base font-semibold text-foreground">
            <span>مبلغ نهایی</span>
            <span>{formatPrice(order.totalPrice, "تومان")}</span>
          </div>
        </div>

        {/* Payment info */}
        {order.payment && (
          <div className="mt-6 border-t border-border_soft pt-4 text-xs text-muted-foreground">
            <p>درگاه پرداخت: {order.payment.gateway}</p>
            {order.payment.refId && <p>کد پیگیری: {order.payment.refId}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
