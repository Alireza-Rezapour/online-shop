const numberFmt = new Intl.NumberFormat("fa-IR");
const compactFmt = new Intl.NumberFormat("fa-IR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dayFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const dateTimeFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tehran",
});

export const formatNumber = (n: number) => numberFmt.format(Math.round(n));
export const formatToman = (n: number) =>
  `${numberFmt.format(Math.round(n))} تومان`;
export const formatCompact = (n: number) => compactFmt.format(n);

/** key is YYYY-MM-DD (already Tehran day) -> Jalali "۱۵ آبان" */
export const formatDayKey = (key: string) =>
  dayFmt.format(new Date(`${key}T12:00:00Z`));
export const formatDateTime = (iso: string) =>
  dateTimeFmt.format(new Date(iso));

/** null when there is no previous value to compare against */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/** Adjust labels/colors to match your OrderStatus enum */
export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پرداخت", color: "var(--chart-4)" },
  PAID: { label: "پرداخت‌شده", color: "var(--chart-1)" },
  PROCESSING: { label: "در حال پردازش", color: "var(--chart-2)" },
  SHIPPED: { label: "ارسال‌شده", color: "var(--chart-3)" },
  DELIVERED: { label: "تحویل‌شده", color: "var(--chart-5)" },
  CANCELLED: { label: "لغو شده", color: "var(--muted-foreground)" },
  RETURNED: { label: "مرجوعی", color: "var(--destructive)" },
};

export const statusLabel = (s: string) => ORDER_STATUS[s]?.label ?? s;
export const statusColor = (s: string) =>
  ORDER_STATUS[s]?.color ?? "var(--muted-foreground)";
