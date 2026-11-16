"use client";

import { Input } from "@/components/ui/input";
import { toEnglishDigits } from "../lib/product/product-utils";

type Props = {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function PriceInput({ value, onChange, ...rest }: Props) {
  return (
    <Input
      dir="ltr"
      inputMode="numeric"
      autoComplete="off"
      value={value == null ? "" : value.toLocaleString("en-US")}
      onChange={(e) => {
        const digits = toEnglishDigits(e.target.value).replace(/\D/g, "");
        onChange(digits ? Number(digits) : null);
      }}
      {...rest}
    />
  );
}
