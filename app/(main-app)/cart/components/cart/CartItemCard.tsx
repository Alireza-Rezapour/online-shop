"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { MAX_QTY_PER_ITEM, removeFromCart } from "@/redux/slices/cartSlice";
import { QuantitySelector } from "./QuantitySelector";
import type { CartItem } from "../../types/types";
import { getPublicUrl } from "@/services/storage/storage.public-url";
import { formatPrice } from "@/lib/utils";

interface CartItemCardProps {
  item: CartItem;
  priceChanged?: boolean;
  onQuantityChange: (variantId: string, quantity: number) => void;
}

export function CartItemCard({
  item,
  priceChanged,
  onQuantityChange,
}: CartItemCardProps) {
  const dispatch = useDispatch();

  const unitPrice =
    item.salePrice != null && item.salePrice < item.price
      ? item.salePrice
      : item.price;
  const hasSale = unitPrice < item.price;
  const outOfStock = item.availableStock < 1;
  const image = getPublicUrl(item.image) ?? "/null.jpg";

  return (
    <div className="group flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-shadow duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:gap-6 sm:p-5">
      <Link
        href={`/products/${item.slug}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-36 sm:w-32"
      >
        <Image
          src={image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 96px, 128px"
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${outOfStock ? "opacity-50" : ""}`}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/products/${item.slug}`} className="min-w-0">
            <h3 className="mt-1 truncate text-sm font-medium text-neutral-900 sm:text-base">
              {item.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-neutral-200"
                  style={{ backgroundColor: item.colorHex }}
                  aria-hidden="true"
                />
                <span className="text-xs text-neutral-500">
                  {item.colorName}
                </span>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600"
              >
                اندازه {item.sizeName}
              </Badge>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => dispatch(removeFromCart(item.variantId))}
            aria-label={`حذف ${item.title} از سبد خرید`}
            className="shrink-0 rounded-full p-2 text-neutral-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#68578b]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <QuantitySelector
            quantity={item.cartQty}
            onChange={(quantity) => onQuantityChange(item.variantId, quantity)}
            productName={item.title}
            maxQuantity={Math.min(item.availableStock, MAX_QTY_PER_ITEM)}
          />

          <div className="text-right">
            {priceChanged && (
              <p className="mb-1 text-[11px] font-medium text-amber-600">
                قیمت تغییر کرده است
              </p>
            )}
            <p className="text-xs text-neutral-400">
              هرکدام{" "}
              {hasSale && (
                <span className="line-through">{formatPrice(item.price)}</span>
              )}
              {formatPrice(unitPrice, "تومان")}
            </p>
            <p className="text-sm font-semibold text-neutral-900 sm:text-base">
              {formatPrice(item.cartQty * unitPrice, "تومان")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
