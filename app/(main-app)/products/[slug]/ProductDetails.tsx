"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Check,
  ChevronLeft,
  Heart,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";

import ProductGallery from "../components/ProductGallery";
import ColorSelector, { type ColorOption } from "../components/ColorSelector";
import SizeSelector, { type SizeOption } from "../components/SizeSelector";
import QuantitySelector from "../components/QuantitySelector";
import Tabs from "../components/Tabs";
import ReviewsSection from "../components/ReviewsSection";

import {
  addToCart,
  MAX_QTY_PER_ITEM,
  selectCartQtyByVariant,
  type CartRootState,
} from "@/redux/slices/cartSlice";
import type { CartItem } from "@/app/(main-app)/cart/types/types";
import { useToggleFavoriteMutation } from "@/redux/services/favoriteApi";
import { useGetStoreProductBySlugQuery } from "@/redux/services/storeProductApi";
import { formatPrice } from "@/lib/utils";

const TABS = ["توضیحات", "ویژگی‌ها", "نظرات"] as const;
type TabName = (typeof TABS)[number];

const faNum = (n: number) => n.toLocaleString("fa-IR");

/** Keep the chosen size if the new color has it in stock; auto-pick when only one size is left. */
function pickSize(
  variants: {
    color: { id: string };
    size: { id: string };
    availableStock: number;
  }[],
  colorId: string,
  prevSizeId: string,
) {
  const inStock = variants.filter(
    (v) => v.color.id === colorId && v.availableStock > 0,
  );
  if (inStock.some((v) => v.size.id === prevSizeId)) return prevSizeId;
  return inStock.length === 1 ? inStock[0].size.id : "";
}

/* ------------------------------ states ------------------------------ */

function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white text-[#1c1a1f]">
      <div className="mx-auto max-w-6xl animate-pulse px-5 py-10 sm:px-8 lg:px-10">
        <div className="mb-8 h-3 w-56 rounded bg-[#ece9e5]" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-5">
            <div className="flex gap-3 md:w-22 md:flex-col">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-3/4 w-16 rounded-xl bg-[#ece9e5] md:w-full"
                />
              ))}
            </div>
            <div className="aspect-3/4 w-full flex-1 rounded-3xl bg-[#ece9e5]" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-9 w-3/4 rounded bg-[#ece9e5]" />
            <div className="h-6 w-1/3 rounded bg-[#ece9e5]" />
            <div className="mt-6 h-10 w-2/3 rounded-full bg-[#ece9e5]" />
            <div className="h-10 w-1/2 rounded-full bg-[#ece9e5]" />
            <div className="mt-6 h-13 w-full rounded-full bg-[#ece9e5]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-28 text-center">
      <p className="text-lg font-medium text-[#1c1a1f]">محصول پیدا نشد.</p>
      <p className="text-sm text-[#1c1a1f]/55">
        ممکن است این محصول حذف شده یا آدرس آن تغییر کرده باشد.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-[#68578b] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#544571]"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}

/* ------------------------------- page ------------------------------- */

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useDispatch();

  // currentData (not data): never shows the previous product while a new slug loads
  const { currentData: product, isError } = useGetStoreProductBySlugQuery(
    slug,
    {
      skip: !slug,
    },
  );
  const [toggleFavorite] = useToggleFavoriteMutation();

  const [tab, setTab] = useState<TabName>("توضیحات");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [needSize, setNeedSize] = useState(false);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(true);

  const ctaRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  const variants = useMemo(() => product?.variants ?? [], [product]);

  // Start every product with the first color that still has stock
  useEffect(() => {
    if (!product) return;
    const first = product.variants.find((v) => v.availableStock > 0);
    const colorId = first?.color.id ?? "";
    setSelectedColor(colorId);
    setSelectedSize(colorId ? pickSize(product.variants, colorId, "") : "");
    setQuantity(1);
    setNeedSize(false);
    setAdded(false);
    setTab("توضیحات");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  useEffect(() => {
    if (product) setIsFavorite(product.isFavorite);
  }, [product?.id, product?.isFavorite]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 3000);
    return () => clearTimeout(t);
  }, [added]);

  // Show the sticky buy bar (mobile) once the main button leaves the screen
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      setCtaVisible(e.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, [product?.id]);

  const colorOptions = useMemo<ColorOption[]>(() => {
    const map = new Map<string, ColorOption>();
    for (const v of variants) {
      const known = map.get(v.color.id);
      map.set(v.color.id, {
        ...v.color,
        inStock: v.availableStock > 0 || !!known?.inStock,
      });
    }
    return [...map.values()];
  }, [variants]);

  // Variants arrive sorted by the size chart order, so first-seen order is the chart order
  const sizeOptions = useMemo<SizeOption[]>(() => {
    const stockForColor = new Map<string, number>();
    for (const v of variants) {
      if (v.color.id === selectedColor)
        stockForColor.set(v.size.id, v.availableStock);
    }
    const seen = new Map<string, SizeOption>();
    for (const v of variants) {
      if (!seen.has(v.size.id)) {
        seen.set(v.size.id, {
          id: v.size.id,
          name: v.size.name,
          availableStock: stockForColor.get(v.size.id) ?? 0,
        });
      }
    }
    return [...seen.values()];
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => v.color.id === selectedColor && v.size.id === selectedSize,
      ),
    [variants, selectedColor, selectedSize],
  );

  // What the shopper already put in the cart counts against the stock
  const inCart = useSelector(
    selectCartQtyByVariant(selectedVariant?.id ?? ""),
  ) as number;

  /* ---- early returns (all hooks are above this line) ---- */

  if (!product)
    return isError ? <ProductNotFound /> : <ProductDetailsSkeleton />;

  const maxAddable = selectedVariant
    ? Math.max(
        0,
        Math.min(MAX_QTY_PER_ITEM, selectedVariant.availableStock) - inCart,
      )
    : undefined;
  const qty =
    maxAddable === undefined
      ? quantity
      : Math.min(quantity, Math.max(maxAddable, 1));

  const price = selectedVariant?.price ?? product.basePrice;
  const sale = selectedVariant ? selectedVariant.salePrice : product.salePrice;
  const unit = sale ?? price;
  const percent = sale != null ? Math.round((1 - sale / price) * 100) : null;

  const soldOut = !product.isAvailable;
  const cartFull = !!selectedVariant && maxAddable === 0;

  const stock = soldOut
    ? { dot: "bg-red-500", text: "این محصول در حال حاضر ناموجود است" }
    : selectedVariant
      ? selectedVariant.availableStock <= 5
        ? {
            dot: "bg-amber-500",
            text: `فقط ${faNum(selectedVariant.availableStock)} عدد در انبار مانده`,
          }
        : { dot: "bg-emerald-500", text: "موجود در انبار" }
      : null;

  const galleryImages = product.images.length
    ? product.images
    : product.coverImage
      ? [{ url: product.coverImage, alt: product.title }]
      : [];

  /* ------------------------------ handlers ----------------------------- */

  const handleColor = (colorId: string) => {
    setSelectedColor(colorId);
    setSelectedSize((prev) => pickSize(variants, colorId, prev));
    setAdded(false);
  };

  const handleSize = (sizeId: string) => {
    setSelectedSize(sizeId);
    setNeedSize(false);
    setAdded(false);
  };

  const handleAdd = () => {
    if (!selectedVariant) {
      // Nudge instead of a dead disabled button
      setNeedSize(true);
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!maxAddable) return;

    const item: CartItem = {
      variantId: selectedVariant.id,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      colorId: selectedVariant.color.id,
      colorName: selectedVariant.color.name,
      colorHex: selectedVariant.color.hex,
      sizeId: selectedVariant.size.id,
      sizeName: selectedVariant.size.name,
      price: selectedVariant.price,
      salePrice: selectedVariant.salePrice,
      availableStock: selectedVariant.availableStock,
      image: product.coverImage ?? product.images[0]?.url ?? null,
      cartQty: qty,
    };
    dispatch(addToCart(item));
    setAdded(true);
  };

  const handleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next); // optimistic
    try {
      await toggleFavorite({ productId: product.id }).unwrap();
    } catch (err) {
      setIsFavorite(!next);
      if ((err as { status?: number })?.status === 401) router.push("/login");
    }
  };

  const ctaDisabled = soldOut || cartFull;
  const ctaLabel = soldOut
    ? "ناموجود"
    : cartFull
      ? "حداکثر موجودی در سبد شماست"
      : added
        ? "به سبد خرید اضافه شد"
        : "افزودن به سبد خرید";

  const ctaClass = `inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-sm transition duration-200 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2 ${
    added ? "bg-[#3f7d5a]" : "bg-[#68578b] hover:bg-[#544571]"
  }`;

  const ctaContent = added ? (
    <Check
      size={17}
      className="transition-transform duration-200 starting:scale-50"
    />
  ) : (
    <ShoppingBag size={17} />
  );

  return (
    <div className="min-h-screen bg-white text-[#1c1a1f]">
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 lg:px-10 lg:pb-12 lg:pt-10">
        {/* Breadcrumb */}
        <nav
          aria-label="مسیر صفحه"
          className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-[#1c1a1f]/50"
        >
          <Link href="/" className="transition-colors hover:text-[#68578b]">
            صفحه اصلی
          </Link>
          {product.categoryPath.map((c) => (
            <Fragment key={c.id}>
              <ChevronLeft size={12} className="shrink-0" />
              <Link
                href={`/categories/${c.slug}`}
                className="transition-colors hover:text-[#68578b]"
              >
                {c.name}
              </Link>
            </Fragment>
          ))}
          <ChevronLeft size={12} className="shrink-0" />
          <span aria-current="page" className="text-[#1c1a1f]/80">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery (key resets the active image when the product changes) */}
          <ProductGallery
            key={product.id}
            images={galleryImages}
            productName={product.title}
            badge={percent ? `${faNum(percent)}٪ تخفیف` : null}
          />

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {product.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                key={unit}
                className="inline-block text-2xl font-semibold tabular-nums transition duration-300 starting:translate-y-1 starting:opacity-0"
              >
                {formatPrice(unit)}
              </span>
              {sale != null && (
                <span className="text-base tabular-nums text-[#1c1a1f]/40 line-through">
                  {formatPrice(price)}
                </span>
              )}
              {percent ? (
                <span className="rounded-full bg-[#68578b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#68578b]">
                  {faNum(percent)}٪ تخفیف
                </span>
              ) : null}
            </div>

            <div className="my-7 h-px w-full bg-[#e8e5e1]" />

            <div className="flex flex-col gap-7">
              <ColorSelector
                colors={colorOptions}
                selected={selectedColor}
                onSelect={handleColor}
              />

              <div ref={sizeRef}>
                <SizeSelector
                  sizes={sizeOptions}
                  selected={selectedSize}
                  onSelect={handleSize}
                  invalid={needSize && !selectedVariant}
                />
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4">
                <QuantitySelector
                  quantity={qty}
                  onChange={setQuantity}
                  maxQuantity={maxAddable}
                  disabled={soldOut || cartFull}
                />
                <div className="flex flex-col items-end gap-1.5 text-sm">
                  {stock && (
                    <span
                      key={stock.text}
                      className="flex items-center gap-2 text-[#1c1a1f]/70 transition duration-200 starting:opacity-0"
                    >
                      <span className={`h-2 w-2 rounded-full ${stock.dot}`} />
                      {stock.text}
                    </span>
                  )}
                  {selectedVariant && inCart > 0 && (
                    <span className="text-xs text-[#1c1a1f]/50">
                      {faNum(inCart)} عدد از این مدل در سبد شماست
                    </span>
                  )}
                  {selectedVariant && (
                    <span className="text-xs text-[#1c1a1f]/40">
                      کد کالا: <bdi>{selectedVariant.sku}</bdi>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="my-7 h-px w-full bg-[#e8e5e1]" />

            {/* Primary actions */}
            <div ref={ctaRef} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={ctaDisabled}
                  className={`${ctaClass} h-13 flex-1 px-6`}
                >
                  {ctaContent}
                  {ctaLabel}
                </button>

                <button
                  type="button"
                  onClick={handleFavorite}
                  aria-pressed={isFavorite}
                  aria-label={
                    isFavorite
                      ? "حذف از علاقه‌مندی‌ها"
                      : "افزودن به علاقه‌مندی‌ها"
                  }
                  title={
                    isFavorite
                      ? "حذف از علاقه‌مندی‌ها"
                      : "افزودن به علاقه‌مندی‌ها"
                  }
                  className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-[#1c1a1f]/15 transition duration-200 hover:border-[#68578b] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2"
                >
                  <Heart
                    key={String(isFavorite)}
                    size={20}
                    className={`transition duration-300 ${
                      isFavorite
                        ? "fill-[#68578b] text-[#68578b] starting:scale-50"
                        : "text-[#1c1a1f]/70"
                    }`}
                  />
                </button>
              </div>

              <div className="min-h-5 text-center text-sm">
                {added && (
                  <Link
                    href="/cart"
                    className="inline-block text-[#68578b] underline underline-offset-4 transition duration-200 starting:-translate-y-1 starting:opacity-0"
                  >
                    مشاهده سبد خرید
                  </Link>
                )}
              </div>
            </div>

            {/* Trust */}
            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#faf9f7] p-5 text-sm text-[#1c1a1f]/65">
              <div className="flex items-center gap-3">
                <Truck size={18} className="shrink-0 text-[#68578b]" />
                ارسال رایگان برای سفارش‌های بالاتر از ۲ میلیون
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={18} className="shrink-0 text-[#68578b]" />
                امکان مرجوعی تا ۳۰ روز پس از تحویل
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />

          <div
            key={tab}
            className="py-8 transition duration-300 starting:opacity-0"
          >
            {tab === "توضیحات" && (
              <div className="max-w-2xl whitespace-pre-line text-[15px] leading-8 text-[#1c1a1f]/75">
                {product.description?.trim() ||
                  "توضیحاتی برای این محصول ثبت نشده است."}
              </div>
            )}

            {tab === "ویژگی‌ها" &&
              (product.attributes.length > 0 ? (
                <div className="max-w-2xl overflow-hidden rounded-2xl border border-[#e8e5e1]">
                  <table className="w-full text-[15px]">
                    <tbody>
                      {product.attributes.map((attr, i) => (
                        <tr
                          key={`${attr.name}-${attr.value}`}
                          className={i % 2 === 0 ? "bg-[#faf9f7]" : "bg-white"}
                        >
                          <th
                            scope="row"
                            className="w-40 px-5 py-3.5 text-right font-medium text-[#1c1a1f]/60 sm:w-52"
                          >
                            {attr.name}
                          </th>
                          <td className="px-5 py-3.5">{attr.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-[#1c1a1f]/55">
                  ویژگی‌ای برای این محصول ثبت نشده است.
                </p>
              ))}

            {tab === "نظرات" && <ReviewsSection productId={product.id} />}
          </div>
        </div>
      </div>

      {/* Sticky buy bar: mobile only, appears when the main button is out of view */}
      {!ctaVisible && !soldOut && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8e5e1] bg-white/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition duration-300 starting:translate-y-full lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-[#1c1a1f]/55">
                {product.title}
              </p>
              <p className="text-sm font-semibold tabular-nums">
                {formatPrice(unit)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={ctaDisabled}
              className={`${ctaClass} h-11 shrink-0 px-6`}
            >
              {ctaContent}
              {added ? "اضافه شد" : "افزودن به سبد"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
