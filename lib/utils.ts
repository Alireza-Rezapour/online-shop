export { cn } from "cn";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function formatPrice(amount: number, suffix: string = ""): string {
  const withSeparators = amount.toLocaleString("en-US");
  return `${toPersianDigits(withSeparators)} ${suffix}`;
}
