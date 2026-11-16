import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/services/dashboard/dashboard.types";
import {
  formatDateTime,
  formatNumber,
  formatToman,
  statusColor,
  statusLabel,
} from "./format";

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function TopProducts({ data }: { data: DashboardStats["topProducts"] }) {
  if (data.length === 0) return <Empty>هنوز محصولی فروخته نشده است.</Empty>;

  const max = Math.max(...data.map((p) => p.quantity));

  return (
    <ul className="space-y-4">
      {data.map((p) => (
        <li key={p.productId} className="flex items-center gap-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium">{p.title}</p>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatNumber(p.quantity)} عدد
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(p.quantity / max) * 100}%` }}
              />
            </div>
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatToman(p.revenue)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RecentOrders({
  data,
}: {
  data: DashboardStats["recentOrders"];
}) {
  if (data.length === 0) return <Empty>هنوز سفارشی ثبت نشده است.</Empty>;

  return (
    <ul className="divide-y">
      {data.map((o) => (
        <li key={o.id}>
          <Link
            href={`/admin/orders/${o.id}`}
            className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-sm font-medium">{o.customerName}</p>
              <p className="text-xs text-muted-foreground">
                <span dir="ltr">{o.orderNumber}</span>
                <span className="mx-1.5">·</span>
                {formatDateTime(o.createdAt)}
              </p>
            </div>
            <div className="shrink-0 space-y-1 text-end">
              <p className="text-sm font-medium tabular-nums">
                {formatToman(o.totalPrice)}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ background: statusColor(o.status) }}
                />
                {statusLabel(o.status)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function LowStock({ data }: { data: DashboardStats["lowStock"] }) {
  if (data.length === 0) return <Empty>موجودی همه محصولات کافی است.</Empty>;

  return (
    <ul className="divide-y">
      {data.map((v) => (
        <li
          key={v.variantId}
          className="flex items-center justify-between gap-3 py-3"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-sm font-medium">{v.productTitle}</p>
            <p className="text-xs text-muted-foreground">
              {[v.colorName, v.sizeName].filter(Boolean).join(" / ") || v.sku}
            </p>
          </div>
          <Badge
            variant={v.stock <= 0 ? "destructive" : "secondary"}
            className={cn("shrink-0 tabular-nums")}
          >
            {v.stock <= 0 ? "ناموجود" : `${formatNumber(v.stock)} عدد`}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
