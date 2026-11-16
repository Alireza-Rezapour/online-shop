import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatNumber, percentChange } from "./format";

interface KpiCardProps {
  label: string;
  value: number;
  previous: number;
  format: (n: number) => string;
}

export function KpiCard({ label, value, previous, format }: KpiCardProps) {
  const change = percentChange(value, previous);
  const up = change !== null && change >= 0;

  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{format(value)}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {change === null ? (
            <span>مقایسه‌ای وجود ندارد</span>
          ) : (
            <>
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  up ? "text-emerald-600" : "text-destructive",
                )}
              >
                {up ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                <span dir="ltr">{formatNumber(Math.abs(change))}٪</span>
              </span>
              <span>نسبت به دوره قبل</span>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export interface OperationItem {
  label: string;
  value: string;
  href?: string;
  alert?: boolean;
}

/** One quiet strip for the numbers an admin needs to act on */
export function OperationsStrip({ items }: { items: OperationItem[] }) {
  return (
    <Card>
      <CardContent className="grid grid-cols-2 divide-y p-0 md:grid-cols-5 md:divide-x md:divide-y-0">
        {items.map((item) => {
          const body = (
            <div className="space-y-1 p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p
                className={cn(
                  "text-lg font-semibold tabular-nums",
                  item.alert && "text-destructive",
                )}
              >
                {item.value}
              </p>
            </div>
          );
          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:bg-muted/50"
            >
              {body}
            </Link>
          ) : (
            <div key={item.label}>{body}</div>
          );
        })}
      </CardContent>
    </Card>
  );
}
