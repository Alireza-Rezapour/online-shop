"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  productName: string;
  maxQuantity?: number; // undefined = no limit
}

export function QuantitySelector({
  quantity,
  onChange,
  productName,
  maxQuantity,
}: QuantitySelectorProps) {
  const atMax = maxQuantity !== undefined && quantity >= maxQuantity;
  const outOfStock = maxQuantity !== undefined && maxQuantity <= 0;

  const decrease = () => {
    if (quantity > 1) onChange(quantity - 1);
  };

  const increase = () => {
    if (atMax) return;
    onChange(quantity + 1);
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        className="inline-flex items-center rounded-full border border-neutral-200 bg-white"
        role="group"
        aria-label={`Quantity for ${productName}`}
      >
        <button
          type="button"
          onClick={decrease}
          disabled={quantity <= 1}
          aria-label={`Decrease quantity of ${productName}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 hover:text-[#68578b] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#68578b]"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span
          className="w-7 select-none text-center text-sm font-medium text-neutral-900"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={atMax}
          aria-label={`Increase quantity of ${productName}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 hover:text-[#68578b] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#68578b]"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {outOfStock ? (
        <span className="text-[11px] text-red-500">ناموجود</span>
      ) : atMax ? (
        <span className="text-[11px] text-neutral-400">
          حداکثر موجودی: {maxQuantity}
        </span>
      ) : null}
    </div>
  );
}
