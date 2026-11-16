"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreProductCardDto } from "@/services/product/store-product.service";
import { ProductCard } from "./ProductCard";

interface ProductsSwiperProps {
  products: StoreProductCardDto[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  /** "bestSelling" shows rank badges on the top three, "newest" marks the last two weeks as new */
  variant?: "default" | "bestSelling" | "newest";
  autoplay?: boolean;
  isLoading?: boolean;
  className?: string;
}

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

const navButton =
  "flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:border-primary hover:bg-primary hover:text-white active:scale-90";

export function ProductsSwiper({
  products,
  title,
  subtitle,
  viewAllHref,
  variant = "default",
  autoplay = true,
  isLoading = false,
  className,
}: ProductsSwiperProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [locked, setLocked] = useState(false);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  const [now] = useState(() => Date.now());
  const barRef = useRef<HTMLDivElement>(null);

  // One reveal when the section first scrolls into view; also drives autoplay
  useEffect(() => {
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.15 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [root]);

  // Autoplay only runs while the section is on screen (and motion is allowed)
  useEffect(() => {
    if (!swiper || swiper.destroyed || !autoplay || !swiper.autoplay) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (inView && !reduce) swiper.autoplay.start();
    else swiper.autoplay.stop();
  }, [swiper, inView, autoplay]);

  const updateBar = (s: SwiperClass) => {
    const bar = barRef.current;
    if (!bar) return;
    const p = Math.min(Math.max(s.progress || 0, 0), 1);
    bar.style.transform = `scaleX(${0.18 + 0.82 * p})`;
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section ref={setRoot} className={cn("relative w-full", className)}>
      <div className="mb-3 flex items-end justify-end gap-4 sm:mb-5">
        {title && (
          <div>
            <h2 className="text-lg font-bold text-neutral-900 sm:text-2xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="group/all inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-foreground sm:text-sm"
            >
              مشاهده همه
              <ArrowLeft className="size-4 transition-transform group-hover/all:-translate-x-1" />
            </Link>
          )}
          {!isLoading && !locked && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="محصولات قبلی"
                onClick={() => swiper?.slidePrev()}
                className={navButton}
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                aria-label="محصولات بعدی"
                onClick={() => swiper?.slideNext()}
                className={navButton}
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <ProductsSwiperSkeleton />
      ) : (
        <>
          <Swiper
            dir="rtl"
            modules={[Autoplay]}
            rewind
            grabCursor
            speed={600}
            spaceBetween={12}
            slidesPerView={2}
            autoplay={
              autoplay
                ? {
                    delay: 4500,
                    pauseOnMouseEnter: true,
                    disableOnInteraction: false,
                  }
                : false
            }
            breakpoints={{
              480: { slidesPerView: 2.2, spaceBetween: 14 },
              640: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 20 },
              1280: { slidesPerView: 5, spaceBetween: 24 },
            }}
            onSwiper={(s) => {
              setSwiper(s);
              setLocked(s.isLocked);
              updateBar(s);
            }}
            onProgress={(s) => updateBar(s)}
            onResize={(s) => setLocked(s.isLocked)}
            onLock={() => setLocked(true)}
            onUnlock={() => setLocked(false)}
            className="px-1 py-4!"
          >
            {products.map((product, i) => (
              <SwiperSlide key={product.id} className="h-auto! items-start!">
                <div
                  className={cn(
                    "w-full transition-all duration-700 ease-out motion-reduce:transition-none",
                    seen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0",
                  )}
                  style={{
                    transitionDelay: seen ? `${Math.min(i, 6) * 80}ms` : "0ms",
                  }}
                >
                  <ProductCard
                    product={product}
                    rank={variant === "bestSelling" ? i + 1 : undefined}
                    isNew={
                      variant === "newest" &&
                      now - Date.parse(product.createdAt) < NEW_WINDOW_MS
                    }
                  />
                </div>
              </SwiperSlide>
            ))}

            {viewAllHref && (
              <SwiperSlide className="h-auto! items-start!">
                <Link
                  href={viewAllHref}
                  className="group/all flex aspect-3/4 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-white text-primary transition-transform duration-300 group-hover/all:-translate-x-1">
                    <ArrowLeft className="size-5" />
                  </span>
                  مشاهده همه
                </Link>
              </SwiperSlide>
            )}
          </Swiper>

          {!locked && (
            <div className="mx-auto mt-1 h-0.5 w-24 overflow-hidden rounded-full bg-neutral-200 sm:w-32">
              <div
                ref={barRef}
                className="h-full origin-right rounded-full bg-primary transition-transform duration-300"
                style={{ transform: "scaleX(0.18)" }}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function ProductsSwiperSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-1 py-4 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5 xl:gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse",
            i === 2 && "hidden sm:block",
            i === 3 && "hidden lg:block",
            i === 4 && "hidden xl:block",
          )}
        >
          <div className="aspect-3/4 w-full rounded-2xl bg-neutral-200" />
          <div className="mt-3 h-3 w-1/3 rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}
