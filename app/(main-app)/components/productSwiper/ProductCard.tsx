"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Check, Flame, Heart, ShoppingBag, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { addToCart } from "@/redux/slices/cartSlice";
import { useToggleFavoriteMutation } from "@/redux/services/favoriteApi";
import type { CartItem } from "@/app/(main-app)/cart/types/types";
import type {
  StoreProductCardDto,
  StoreProductCardVariantDto,
} from "@/services/product/store-product.service";

export interface ProductCardProps {
  product: StoreProductCardDto;
  /** 1-based position in a best-selling list; only the top three get a badge */
  rank?: number;
  priority?: boolean;
  className?: string;
}

const LOW_STOCK = 3;
const MAX_SWATCHES = 4;

const faNum = (n: number) => n.toLocaleString("fa-IR");
const formatPrice = (value: number) => faNum(value) + " تومان";

export function ProductCard({
  product,
  rank,
  priority = false,
  className,
}: ProductCardProps) {
  const {
    id,
    title,
    slug,
    coverImageUrl,
    hoverImageUrl,
    basePrice,
    salePrice,
    discountPercent,
    category,
    colors,
    variants,
    isAvailable,
  } = product;

  const dispatch = useDispatch();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const [favorite, setFavorite] = useState(product.isFavorite);
  const [heartKey, setHeartKey] = useState(0);
  const [colorId, setColorId] = useState<string | undefined>(
    () => (colors.find((c) => c.inStock) ?? colors[0])?.id,
  );
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(false);

  // Keep in sync when the list is refetched
  useEffect(() => {
    setFavorite(product.isFavorite);
  }, [product.isFavorite]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added]);

  const colorVariants = useMemo(
    () => variants.filter((v) => v.colorId === colorId),
    [variants, colorId],
  );
  const buyable = useMemo(
    () => variants.filter((v) => v.availableStock > 0),
    [variants],
  );
  const colorStock = colorVariants.reduce(
    (sum, v) => sum + v.availableStock,
    0,
  );
  const lowStock = colorStock > 0 && colorStock <= LOW_STOCK;
  const hasSale = typeof salePrice === "number";

  const addVariant = (variant: StoreProductCardVariantDto) => {
    const color = colors.find((c) => c.id === variant.colorId);
    const item: CartItem = {
      productId: id,
      slug,
      title,
      image: coverImageUrl,
      variantId: variant.id,
      colorId: variant.colorId,
      colorName: color?.name ?? "",
      colorHex: color?.hex ?? "#000000",
      sizeId: variant.sizeId,
      sizeName: variant.sizeName,
      price: variant.price,
      salePrice: variant.salePrice,
      availableStock: variant.availableStock,
      cartQty: 1,
    };
    dispatch(addToCart(item));
    setPicking(false);
    setAdded(true);
  };

  const handleQuickAdd = () => {
    if (!isAvailable) return;
    // A single purchasable option is added straight away, otherwise pick a size
    if (buyable.length === 1) return addVariant(buyable[0]);
    setPicking((open) => !open);
  };

  const handleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    setHeartKey((k) => k + 1);
    // Optimistic update, rolled back when the request fails (e.g. not logged in)
    toggleFavorite({ productId: id })
      .unwrap()
      .catch(() => setFavorite(!next));
  };

  return (
    <article
      className={cn("group/card relative flex w-full flex-col", className)}
      onMouseLeave={() => setPicking(false)}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Link
          href={`/products/${slug}`}
          aria-label={title}
          className="absolute inset-0 z-0"
        >
          <Image
            src={coverImageUrl || "/empty.jpg"}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out group-hover/card:scale-105",
              hoverImageUrl && "group-hover/card:opacity-0",
              !isAvailable && "opacity-70 grayscale",
            )}
          />
          {hoverImageUrl && (
            <Image
              src={hoverImageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover opacity-0 transition-all duration-700 ease-out group-hover/card:opacity-100"
            />
          )}
        </Link>

        {/* Badges: only what is true about this product */}
        <div className="pointer-events-none absolute right-2 top-2 z-10 flex flex-col items-start gap-1.5">
          {discountPercent ? (
            <span className="rounded-full bg-off px-2 py-0.5 text-[11px] font-bold text-white sm:text-xs">
              {faNum(discountPercent)}٪
            </span>
          ) : null}
          {rank && rank <= 3 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-primary-foreground sm:text-xs">
              <Flame className="size-3 text-amber-500" aria-hidden />
              رتبه {faNum(rank)}
            </span>
          ) : null}
        </div>

        {!isAvailable && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="rounded-full bg-neutral-900/80 px-4 py-1.5 text-xs font-medium text-white">
              ناموجود
            </span>
          </div>
        )}

        {/* Favorite */}
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
          }
          aria-pressed={favorite}
          className="absolute left-2 top-2 z-20 flex items-center justify-center rounded-full bg-white/90 p-1.5 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white active:scale-90"
        >
          <Heart
            key={heartKey}
            className={cn(
              "size-4 transition-colors sm:size-5",
              favorite && "fill-primary text-primary",
              heartKey > 0 && "animate-in zoom-in-50 duration-300",
            )}
          />
        </button>

        {/* Quick add: size picker for the selected colour, then the button */}
        {isAvailable && (
          <div
            className={cn(
              "absolute inset-x-2 bottom-2 z-20 transition-all duration-300",
              "sm:translate-y-3 sm:opacity-0 sm:group-hover/card:translate-y-0 sm:group-hover/card:opacity-100 sm:focus-within:translate-y-0 sm:focus-within:opacity-100",
              picking && "sm:translate-y-0 sm:opacity-100",
            )}
          >
            {picking && (
              <div className="mb-2 rounded-xl bg-white/95 p-2.5 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-700">
                    سایز را انتخاب کنید
                  </span>
                  <button
                    type="button"
                    onClick={() => setPicking(false)}
                    aria-label="بستن"
                    className="rounded-full p-0.5 text-neutral-500 hover:text-neutral-900"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {colorVariants.map((v) => {
                    const out = v.availableStock <= 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={out}
                        onClick={() => addVariant(v)}
                        className={cn(
                          "flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-medium transition",
                          out
                            ? "cursor-not-allowed border-neutral-200 text-neutral-300 line-through"
                            : "border-neutral-300 text-neutral-800 hover:border-primary hover:bg-primary hover:text-white active:scale-95",
                        )}
                      >
                        {v.sizeName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleQuickAdd}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-foreground py-2 text-xs font-medium text-white backdrop-blur transition active:scale-[0.98] sm:text-sm"
            >
              {added ? (
                <>
                  <Check size={14} /> اضافه شد
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  افزودن به سبد خرید
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1 px-0.5">
        <span className="text-[11px] text-neutral-400">{category.name}</span>

        <Link
          href={`/products/${slug}`}
          className="line-clamp-1 text-sm text-neutral-800 transition-colors hover:text-primary sm:text-base"
        >
          {title}
        </Link>

        <div className="flex flex-wrap items-center gap-x-2">
          {hasSale ? (
            <>
              <span className="text-sm font-semibold text-primary-foreground sm:text-base">
                {formatPrice(salePrice)}
              </span>
              <span className="text-xs text-neutral-400 line-through sm:text-sm">
                {formatPrice(basePrice)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-neutral-900 sm:text-base">
              {formatPrice(basePrice)}
            </span>
          )}
        </div>

        {(colors.length > 1 || lowStock) && (
          <div className="mt-1 flex items-center justify-between gap-2">
            {colors.length > 1 ? (
              <div className="flex items-center gap-1.5">
                {colors.slice(0, MAX_SWATCHES).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!c.inStock}
                    onClick={() => setColorId(c.id)}
                    aria-label={c.name}
                    aria-pressed={colorId === c.id}
                    title={c.name}
                    style={{ backgroundColor: c.hex }}
                    className={cn(
                      "size-4 rounded-full ring-1 ring-black/10 transition-transform hover:scale-125 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100",
                      colorId === c.id &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-white",
                    )}
                  />
                ))}
                {colors.length > MAX_SWATCHES && (
                  <span className="text-[11px] text-neutral-400">
                    +{faNum(colors.length - MAX_SWATCHES)}
                  </span>
                )}
              </div>
            ) : (
              <span />
            )}

            {lowStock && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-off">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-off opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-off" />
                </span>
                تنها {faNum(colorStock)} عدد
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
