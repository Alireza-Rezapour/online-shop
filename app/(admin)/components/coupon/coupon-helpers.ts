import { formatPrice } from "@/lib/utils";
import type { CouponDto, CouponStatus } from "@/services/coupon/coupon.schema";

/** Reads the message from a failed RTK Query call (same shape the checkout uses). */
export function getApiError(
  err: unknown,
  fallback = "عملیات ناموفق بود.",
): string {
  const data = (err as { data?: { error?: string; message?: string } })?.data;
  return data?.error ?? data?.message ?? fallback;
}

export const STATUS_META: Record<
  CouponStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "فعال",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  DISABLED: {
    label: "غیرفعال",
    className: "border-neutral-200 bg-neutral-100 text-neutral-600",
  },
  SCHEDULED: {
    label: "زمان‌بندی‌شده",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  EXPIRED: {
    label: "منقضی",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  EXHAUSTED: {
    label: "تمام‌شده",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

export function formatCouponValue(
  c: Pick<CouponDto, "type" | "value">,
): string {
  return c.type === "PERCENTAGE"
    ? `${c.value.toLocaleString("fa-IR")}٪`
    : formatPrice(c.value, "تومان");
}

export function formatFaDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("fa-IR") : "—";
}

/** Persian/Arabic digits -> Latin, and thousands separators/spaces removed. */
export function normalizeDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[,٬،\s]/g, "");
}

/** "" -> null (field left empty), garbage -> NaN, otherwise the number. */
export function parseOptionalNumber(input: string): number | null {
  const cleaned = normalizeDigits(input);
  return cleaned === "" ? null : Number(cleaned);
}

/** ISO string -> value for <input type="datetime-local"> (local time). */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value -> ISO string (or null when empty). */
export function fromDateTimeLocal(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function generateCouponCode(length = 8): string {
  // no 0/O/1/I so codes are easy to read out loud
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++)
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
