"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Product } from "../../types";
import { cn, formatPrice } from "@/lib/utils";
import { StarRating } from "./star-rating";

export function ProductCard({
  product,
  variant = "grid",
  initiallyFavorited = false,
  onQuickView,
}: {
  product: Product;
  variant?: "grid" | "horizontal";
  initiallyFavorited?: boolean;
  onQuickView?: (product: Product) => void;
}) {
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [popping, setPopping] = useState(false);

  const toggleFavorite = () => {
    setFavorited((f) => !f);
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
  };

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-border_soft bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover",
        variant === "horizontal" && "flex w-60 shrink-0 flex-col sm:w-65",
      )}
    >
      <div className="relative aspect-4/5 w-full overflow-hidden bg-primary-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 260px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.discountPercent && (
          <span className="absolute left-3 top-3 rounded-full bg-primary-foreground px-2.5 py-1 text-[11px] font-semibold text-secondary shadow-soft">
            -{product.discountPercent}%
          </span>
        )}
        <button
          onClick={toggleFavorite}
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-soft transition-transform",
            popping && "animate-heart-pop",
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              favorited
                ? "fill-primary-foreground text-primary"
                : "text-foreground/50",
            )}
          />
        </button>
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-1.5 rounded-xl bg-white/95 py-2 text-xs font-medium text-primary-foreground opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Eye className="h-3.5 w-3.5 bg-primary-foreground" /> مشاهده
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="line-clamp-1 text-sm font-medium text-foreground">
          {product.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">
            {formatPrice(product.price, "تومان")}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice, "تومان")}
            </span>
          )}
        </div>
        {product.rating && (
          <div className="mt-1.5">
            <StarRating rating={product.rating} />
          </div>
        )}
        {product.colors && (
          <div className="mt-2 flex items-center gap-1.5">
            {product.colors.map((c) => (
              <span
                key={c}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
        <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-50 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary-foreground hover:text-white">
          <ShoppingBag className="h-3.5 w-3.5" />
          اضافه کردن به سبد خرید
        </button>
      </div>
    </div>
  );
}
