"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Check, Heart, ShoppingBag, X } from "lucide-react";

import { addToCart, selectCartQtyMap } from "@/redux/slices/cartSlice";
import {
  StoreProductCardDto,
  StoreProductCardVariantDto,
} from "@/services/product/store-product.service";
import { getPublicUrl } from "@/services/storage/storage.public-url";
import { formatPrice } from "@/lib/utils";
import { ListProduct } from "./types";
import { useToggleFavoriteMutation } from "@/redux/services/favoriteApi";

export type ListingProduct = StoreProductCardDto & { isFavorite: boolean };

export function ProductCard({ product }: { product: ListProduct }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const cartQty = useSelector(selectCartQtyMap);

  const [favorite, setFavorite] = useState(product.isFavorite);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [colorId, setColorId] = useState(
    () =>
      (product.colors.find((c) => c.inStock) ?? product.colors[0])?.id ?? "",
  );
  const [addedVariantId, setAddedVariantId] = useState<string | null>(null);

  useEffect(() => setFavorite(product.isFavorite), [product.isFavorite]);

  // Confirm the add for a moment, then close the picker
  useEffect(() => {
    if (!addedVariantId) return;
    const timer = setTimeout(() => {
      setAddedVariantId(null);
      setPickerOpen(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [addedVariantId]);

  const sizesOfColor = useMemo(
    () => product.variants.filter((v) => v.colorId === colorId),
    [product.variants, colorId],
  );

  const handleAdd = (variant: StoreProductCardVariantDto) => {
    const color = product.colors.find((c) => c.id === variant.colorId);
    if (!color) return;

    dispatch(
      addToCart({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        image: product.coverImage,
        variantId: variant.id,
        colorId: color.id,
        colorName: color.name,
        colorHex: color.hex,
        sizeId: variant.sizeId,
        sizeName: variant.sizeName,
        price: variant.price,
        salePrice: variant.salePrice,
        availableStock: variant.availableStock,
        cartQty: 1,
      }),
    );
    setAddedVariantId(variant.id);
  };

  const handleFavorite = async () => {
    const previous = favorite;
    setFavorite(!previous);
    try {
      const { favorited } = await toggleFavorite({
        productId: product.id,
      }).unwrap();
      setFavorite(favorited);
    } catch (error) {
      setFavorite(previous);
      if ((error as { status?: number })?.status === 401) {
        const back = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        router.push(`/login?redirect=${back}`);
      }
    }
  };

  const cover = getPublicUrl(product.coverImage) ?? "/null.jpg";
  const hover = getPublicUrl(product.hoverImage);
  const unitPrice = product.salePrice ?? product.basePrice;

  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-[#faf9f7] shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
        <Link
          href={`/products/${product.slug}`}
          className="block aspect-3/4 overflow-hidden"
          aria-label={product.title}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={product.title}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              hover ? "group-hover:opacity-0" : ""
            } ${product.isAvailable ? "" : "opacity-60"}`}
          />
          {hover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hover}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
          )}
        </Link>

        {product.discountPercent && product.isAvailable && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#68578b] px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white">
            {product.discountPercent}%
          </span>
        )}

        {!product.isAvailable && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#1c1a1f]/80 px-2.5 py-1 text-[11px] font-medium text-white">
            ناموجود
          </span>
        )}

        <button
          type="button"
          aria-pressed={favorite}
          aria-label={
            favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
          }
          onClick={handleFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1c1a1f] shadow-sm backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b]"
        >
          <Heart
            size={16}
            className={favorite ? "fill-[#68578b] text-[#68578b]" : ""}
          />
        </button>

        {/* Quick add: pick a size, no guessing */}
        {product.isAvailable && !pickerOpen && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            aria-label={`افزودن سریع ${product.title} به سبد خرید`}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#68578b] text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-[#544571] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2"
          >
            <ShoppingBag size={15} />
          </button>
        )}

        {pickerOpen && (
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#1c1a1f]/70">
                انتخاب سایز
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="بستن"
                className="text-[#1c1a1f]/50 hover:text-[#1c1a1f]"
              >
                <X size={14} />
              </button>
            </div>

            {product.colors.length > 1 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={color.id === colorId}
                    onClick={() => setColorId(color.id)}
                    className={`h-5 w-5 rounded-full p-0.5 ${color.inStock ? "" : "opacity-30"}`}
                    style={{
                      border:
                        color.id === colorId
                          ? "2px solid #68578b"
                          : "2px solid transparent",
                    }}
                  >
                    <span
                      className="block h-full w-full rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            )}

            <div dir="ltr" className="flex flex-wrap gap-1.5">
              {sizesOfColor.map((variant) => {
                const left =
                  variant.availableStock - (cartQty[variant.id] ?? 0);
                const justAdded = addedVariantId === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={left <= 0 || !!addedVariantId}
                    onClick={() => handleAdd(variant)}
                    className={`flex h-8 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-medium transition-colors duration-150 ${
                      justAdded
                        ? "border-[#68578b] bg-[#68578b] text-white"
                        : left <= 0
                          ? "border-[#1c1a1f]/10 text-[#1c1a1f]/30 line-through"
                          : "border-[#1c1a1f]/15 text-[#1c1a1f] hover:border-[#68578b]"
                    }`}
                  >
                    {justAdded ? <Check size={12} /> : variant.sizeName}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="mt-3.5 flex flex-col gap-1"
      >
        <h3 className="text-sm text-[#1c1a1f]">{product.title}</h3>

        <div className="flex flex-col justify-center gap-2 pt-0.5">
          <span className="text-sm font-medium text-[#1c1a1f]">
            {formatPrice(unitPrice, "تومان")}
          </span>
          {product.salePrice && (
            <span className="text-xs text-[#1c1a1f]/40 line-through">
              {formatPrice(product.basePrice, "تومان")}
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-1.5 pt-1"
          aria-label={`رنگ‌ها: ${product.colors.map((c) => c.name).join("، ")}`}
        >
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.id}
              className={`h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/10 ${color.inStock ? "" : "opacity-30"}`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-[11px] text-[#1c1a1f]/45">
              +{product.colors.length - 4}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
