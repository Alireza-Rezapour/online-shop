"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shirt } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { LookDto } from "@/services/look/look.types";
import { LookProductCard } from "./look-product-card";

/** Starts shopping the look from its first product. */
export function LookShopLink({
  look,
  focusable = true,
  className = "",
}: {
  look: LookDto;
  focusable?: boolean;
  className?: string;
}) {
  const first = look.items[0];
  if (!first) return null;
  return (
    <Link
      href={`/products/${first.slug}`}
      tabIndex={focusable ? 0 : -1}
      className={`group/cta flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-secondary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
    >
      خرید این ست
      <ArrowLeft
        className="size-4 transition-transform ltr:rotate-180 rtl:group-hover/cta:-translate-x-1"
        aria-hidden
      />
    </Link>
  );
}

type Props = {
  look: LookDto;
  index: number;
  count: number;
  isActive: boolean;
  swipeable: boolean;
  onSwipe: (direction: "left" | "right") => void;
};

/**
 * Fills its parent completely (the section decides the height).
 * Mobile: photo / title + price / product strip. Desktop: photo | panel.
 */
export function LookSlide({
  look,
  index,
  count,
  isActive,
  swipeable,
  onSwipe,
}: Props) {
  const fa = (n: number) => n.toLocaleString("fa-IR");

  return (
    <article className="flex h-full flex-col gap-3 lg:grid lg:grid-cols-[58fr_42fr] lg:gap-6">
      {/* Photo: the only swipe area, so the product strip keeps native scrolling */}
      <motion.div
        drag={swipeable && isActive ? "x" : false}
        dragSnapToOrigin
        dragElastic={0.25}
        dragDirectionLock
        onDragEnd={(_, info) => {
          const score = info.offset.x + info.velocity.x * 0.2;
          if (score > 60) onSwipe("right");
          else if (score < -60) onSwipe("left");
        }}
        className="group/photo relative min-h-0 flex-1 touch-pan-y overflow-hidden rounded-2xl bg-muted lg:rounded-3xl"
      >
        {look.imageUrl ? (
          <Image
            src={look.imageUrl}
            alt={look.title}
            fill
            priority={index === 0}
            draggable={false}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover/photo:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Shirt className="size-12" aria-hidden />
          </div>
        )}
        <span className="absolute start-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium lg:start-5 lg:top-5">
          ست {fa(index + 1)} از {fa(count)}
        </span>
      </motion.div>

      {/* Info: a quiet row on mobile, a full panel on desktop */}
      <div className="flex shrink-0 flex-col gap-3 lg:min-h-0 lg:gap-0 lg:rounded-3xl lg:border lg:border-border lg:bg-background lg:p-8">
        <div className="flex items-baseline justify-between gap-3 lg:block">
          <h3 className="min-w-0 truncate text-lg font-semibold lg:whitespace-normal lg:text-4xl lg:leading-tight">
            {look.title}
          </h3>
          <span className="shrink-0 text-sm font-semibold lg:hidden">
            {formatPrice(look.totalPrice, "تومان")}
          </span>
        </div>

        {look.description && (
          <p className="mt-4 hidden line-clamp-3 text-sm leading-7 text-muted-foreground lg:block">
            {look.description}
          </p>
        )}

        <p className="mt-6 hidden border-b border-border pb-3 text-sm text-muted-foreground lg:block">
          {fa(look.items.length)} محصول در این ست
        </p>

        <div className="-mx-3 flex gap-3 overflow-x-auto px-3 [scrollbar-width:none] lg:mx-0 lg:mt-2 lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:overflow-x-visible lg:px-0 lg:[scrollbar-width:thin] [&::-webkit-scrollbar]:hidden">
          {look.items.map((product) => (
            <LookProductCard
              key={product.id}
              product={product}
              focusable={isActive}
            />
          ))}
        </div>

        {/* Desktop footer: total + action (on mobile the action lives in the controls bar) */}
        <div className="mt-4 hidden space-y-4 border-t border-border pt-5 lg:block">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">قیمت کل ست</span>
            <span className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">
                {formatPrice(look.totalPrice, "تومان")}
              </span>
              {look.totalOriginalPrice != null && (
                <del className="text-sm text-muted-foreground">
                  {formatPrice(look.totalOriginalPrice, "تومان")}
                </del>
              )}
            </span>
          </div>
          <LookShopLink look={look} focusable={isActive} className="w-full" />
        </div>
      </div>
    </article>
  );
}
