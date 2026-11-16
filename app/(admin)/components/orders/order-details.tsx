"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { getCustomerName } from "./order-utils";
import { useGetOrderQuery } from "@/redux/services/orderApi";
import { OrderStatusBadge } from "@/app/(dashboard)/components/shared/order-status-badge";
import { formatDate } from "@/app/(dashboard)/data/utils";
import { OrderStatusSection } from "./order-status-section";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { ShipmentSection } from "./shipment-section";

export function OrderDetails({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: order, isLoading } = useGetOrderQuery(orderId as string, {
    skip: !orderId,
  });

  // A cancelled or returned order whose payment went through still owes the customer money
  const refundDue =
    !!order &&
    (order.status === "CANCELLED" || order.status === "RETURNED") &&
    order.payment?.status === "SUCCESS";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading && (
          <p className="p-4 text-sm text-muted-foreground">درحال بارگذاری...</p>
        )}

        {order && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center justify-end gap-2">
                سفارش {order.orderNumber}
                <OrderStatusBadge status={order.status} />
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6 p-4">
              <section>
                <h3 className="mb-2 font-medium">وضعیت سفارش</h3>
                <OrderStatusSection
                  key={`${order.id}-${order.status}`}
                  orderId={order.id}
                  currentStatus={order.status}
                />
              </section>

              <Separator />

              <section>
                <h3 className="mb-2 font-medium">مشتری</h3>
                <p className="mb-1 text-sm">{getCustomerName(order.user)}</p>
                <p className="mb-1 text-sm text-muted-foreground">
                  {order.user?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  ثبت شده در {formatDate(order.createdAt)}
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="mb-2 font-medium">آدرس ارسال</h3>
                <p className="text-sm">{order.shippingReceiverName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingPhone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress}, {order.shippingCity},{" "}
                  {order.shippingProvince}, {order.shippingPostalCode}
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="mb-2 font-medium">محصولات</h3>
                <div dir="ltr" className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.productTitle}</p>
                        <p className="text-muted-foreground">
                          {item.colorName} / {item.sizeName} · SKU {item.sku} ·
                          x{item.quantity}
                        </p>
                      </div>
                      <p>{formatPrice(item.lineTotal, "تومان")}</p>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span>جمع جزئی</span>
                  <span>{formatPrice(order.subtotal, "تومان")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>تخفیف</span>
                  <span>-{formatPrice(order.discount, "تومان")}</span>
                </div>
                {order.couponCode && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>کد تخفیف استفاده‌شده</span>
                    <span dir="ltr">{order.couponCode}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>ارسال</span>
                  <span>{formatPrice(order.shippingFee, "تومان")}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>مجموع</span>
                  <span>{formatPrice(order.totalPrice, "تومان")}</span>
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="mb-2 font-medium">پرداخت</h3>
                {order.payment ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={order.payment.status}
                        kind="payment"
                      />
                      <span className="text-muted-foreground">
                        {order.payment.gateway}
                      </span>
                    </div>
                    <p>مقدار: {formatPrice(order.payment.amount, "تومان")}</p>
                    {order.payment.paidAt && (
                      <p>پرداخت شده در: {formatDate(order.payment.paidAt)}</p>
                    )}
                    {order.payment.refId && (
                      <p dir="ltr">Ref: {order.payment.refId}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">پرداخت نشده</p>
                )}

                {refundDue && (
                  <div className="mt-3 space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <p>
                      مبلغ این سفارش پرداخت شده و هنوز بازگردانده نشده است.
                      بازگشت وجه باید از طریق درگاه انجام شود.
                    </p>
                    {order.status === "RETURNED" && (
                      <p>
                        موجودی کالاهای مرجوعی به‌صورت خودکار به انبار
                        برنمی‌گردد.
                      </p>
                    )}
                  </div>
                )}
              </section>

              <Separator />

              <section>
                <h3 className="mb-2 font-medium">ارسال</h3>
                <ShipmentSection
                  key={`${order.id}-${order.shipment?.id ?? "none"}`}
                  orderId={order.id}
                  orderStatus={order.status}
                  shipment={order.shipment}
                />
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
