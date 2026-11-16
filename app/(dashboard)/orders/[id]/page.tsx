"use client";

import { ReactElement, use } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  FileText,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetOrderQuery } from "@/redux/services/orderApi";
import { formatDate } from "../../data/utils";
import { OrderStatusBadge } from "../../components/shared/order-status-badge";
import { OrderItemRow } from "../../components/orders/order-item-row";
import { OrderItem } from "../../types";
import { PriceSummary } from "../../components/orders/price-summary";
import { formatPrice } from "@/lib/utils";

// TODO: point this at your real RTK Query slice/hook
// import { useGetOrderByIdQuery } from "@/store/services/order-api";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, isError } = useGetOrderQuery(id);

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          سفارش مورد نظر یافت نشد.
        </p>
        <Link href="/orders">
          <Button variant="outline" className="mt-4">
            بازگشت به سفارش‌ها
          </Button>
        </Link>
      </div>
    );
  }

  const quantity = order.items.reduce(
    (acc: number, item: OrderItem) => acc + item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-sm font-semibold text-foreground">
              سفارش {order.id}
            </p>
            <p className="text-xs text-muted-foreground">
              ثبت شده در تاریخ {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border_soft bg-white p-5 shadow-soft">
        <h2 className="mb-2 text-sm font-semibold text-foreground">
          محصولات ({quantity})
        </h2>
        <div className="divide-y divide-border_soft">
          {order.items.map((item: OrderItem) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Shipping info */}
      <div className="rounded-2xl border border-border_soft bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">آدرس ارسال</h2>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <InfoRow label="گیرنده" value={order.shippingReceiverName} />
          <InfoRow label="شماره تماس" value={order.shippingPhone} />
          <InfoRow label="استان" value={order.shippingProvince} />
          <InfoRow label="شهر" value={order.shippingCity} />
          <InfoRow label="کد پستی" value={order.shippingPostalCode} />
          <InfoRow label="آدرس" value={order.shippingAddress} full />
        </div>
      </div>

      {/* Payment + Shipment */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border_soft bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">پرداخت</h2>
          </div>
          {order.payment ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <InfoRow label="درگاه" value={order.payment.gateway} />
              <InfoRow label="مبلغ" value={order.payment.amount} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              پرداختی ثبت نشده است.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border_soft bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">ارسال</h2>
          </div>
          {order.shipment ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              {/* TODO: adjust field names to match your Shipment type */}
              <InfoRow
                label="کد رهگیری"
                value={order.shipment.trackingCode ?? "—"}
              />
              <InfoRow label="وضعیت" value={order.shipment.status ?? "—"} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              سفارش هنوز ارسال نشده است.
            </p>
          )}
        </div>
      </div>

      {/* Price summary */}
      <div className="rounded-2xl border border-border_soft bg-white p-5 shadow-soft">
        <PriceSummary
          subtotal={order.subtotal}
          discount={order.discount}
          shippingFee={order.shippingFee}
          totalPrice={order.totalPrice}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/orders/${order.id}/bills`}>
          <Button variant="outline" size="sm">
            <FileText className="h-3.5 w-3.5" /> مشاهده صورت‌حساب
          </Button>
        </Link>
        {order.shipment && (
          <Button variant="outline" size="sm">
            <Truck className="h-3.5 w-3.5" /> رهگیری مرسوله
          </Button>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  full,
}: {
  label: string;
  value: ReactElement;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-16 rounded-2xl bg-primary-50" />
      <div className="h-40 rounded-2xl bg-primary-50" />
      <div className="h-32 rounded-2xl bg-primary-50" />
    </div>
  );
}
