"use client";

import { Button } from "@/components/ui/button";
import { Truck, FileText, ChevronRight } from "lucide-react";
import { Order } from "../../types";
import { OrderStatusBadge } from "../shared/order-status-badge";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { formatDate } from "../../data/utils";
import { OrderDto } from "@/services/order/order.dto";
import { getPublicUrl } from "@/services/storage/storage.public-url";

export function OrderCard({ order }: { order: OrderDto }) {
  const quantity = order.items.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);

  const images = order.items.reduce((acc: string[], item) => {
    return [...acc, getPublicUrl(item.image)!];
  }, []);

  const [showTracking, setShowTracking] = useState(false);

  let tracking;

  switch (order.status) {
    case "CANCELLED":
      tracking = "سفارش لغو شده است";

      break;
    case "DELIVERED":
      tracking = "سفارش تحویل داده شده است";

      break;
    case "PENDING":
      tracking = "سفارش در انتظار پرداخت است";

      break;
    case "PAID":
      tracking = "پرداخت انجام شده و سفارش در انتظار تایید است";

      break;

    case "PROCESSING":
      tracking = "سفارش تایید شده و در انتظار ارسال است";

      break;

    case "RETURNED":
      tracking = "سفارش مرجوع شده است";

      break;

    case "SHIPPED":
      tracking = "سفارش ارسال شده است";

      break;

    default:
      break;
  }

  return (
    <div className="rounded-2xl border border-border_soft bg-white p-5 shadow-soft transition-shadow hover:shadow-hover">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {order.orderNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            ثبت شده در تاریخ {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex -space-x-3">
        {images.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-primary-50 shadow-soft"
          >
            <Image
              src={image}
              alt={order.id}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        ))}
        {order.items.length > 4 && (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-primary-100 text-xs font-medium text-primary">
            +{order.items.length - 4}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border_soft pt-4">
        <div>
          <p className="text-xs text-muted-foreground">{quantity} محصول</p>
          <p className="font-display text-lg font-medium text-foreground">
            {formatPrice(order.totalPrice, "تومان")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowTracking((prev) => !prev)}
            variant="outline"
            size="sm"
          >
            <Truck className="h-3.5 w-3.5" /> رهگیری
          </Button>
          <Link
            href={`/orders/${order.id}/bills`}
            className="text-sm flex items-center gap-2 bg-primary-foreground text-secondary px-3 rounded-sm"
          >
            <FileText className="h-3.5 w-3.5" /> صورت حساب
          </Link>
          <Link
            href={`/orders/${order.id}`}
            className="text-sm flex items-center gap-2 bg-primary-foreground text-secondary px-3 rounded-sm"
          >
            جزییات <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className={`${showTracking ? "block" : "hidden"}`}>
        <p className="text-center">{tracking}</p>
      </div>
    </div>
  );
}
