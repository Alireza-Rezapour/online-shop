"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export type GalleryImage = { url: string; alt: string };

type ProductGalleryProps = {
  images: GalleryImage[];
  productName: string;
  /** e.g. "۲۰٪ تخفیف" — shown on the image corner */
  badge?: string | null;
};

const faNum = (n: number) => n.toLocaleString("fa-IR");

export default function ProductGallery({
  images,
  productName,
  badge,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  // Mouse position over the image (in %), null when not zooming
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchStartX = useRef<number | null>(null);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="flex aspect-3/4 w-full flex-col items-center justify-center gap-3 rounded-3xl bg-[#f3f1ee] text-[#1c1a1f]/40">
        <ImageOff size={28} />
        <span className="text-sm">تصویری برای این محصول ثبت نشده است</span>
      </div>
    );
  }

  const go = (i: number) => {
    setZoom(null);
    setActive(((i % count) + count) % count);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // zoom is a mouse-only gesture
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  // The page is RTL: the next image is to the left, so a swipe to the left goes forward
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    go(dx < 0 ? active + 1 : active - 1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(active + 1);
    if (e.key === "ArrowRight") go(active - 1);
  };

  const arrow =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#1c1a1f] opacity-0 shadow-sm backdrop-blur transition duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 active:scale-95";
  const arrowGuard = {
    onPointerMove: (e: React.PointerEvent) => e.stopPropagation(),
    onPointerEnter: () => setZoom(null),
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-5">
      {/* Thumbnails: row on mobile, vertical rail on desktop */}
      {count > 1 && (
        <div
          className="flex gap-3 overflow-x-auto p-1 md:w-22 md:flex-col md:overflow-visible"
          role="tablist"
          aria-label="تصاویر محصول"
        >
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`نمایش تصویر ${faNum(i + 1)}`}
              onClick={() => go(i)}
              className={`relative aspect-3/4 w-16 shrink-0 overflow-hidden rounded-xl transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2 md:w-full ${
                active === i
                  ? "ring-2 ring-[#68578b] ring-offset-2"
                  : "opacity-55 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div
        className="group relative aspect-3/4 w-full flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-[#f3f1ee] outline-none focus-visible:ring-2 focus-visible:ring-[#68578b]"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`تصاویر ${productName}`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setZoom(null)}
        onKeyDown={onKeyDown}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        {images.map((img, i) => (
          <img
            key={img.url}
            src={img.url}
            alt={img.alt || `${productName} — تصویر ${faNum(i + 1)}`}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            aria-hidden={i !== active}
            className={`absolute inset-0 h-full w-full select-none object-cover transition duration-300 ease-out starting:scale-[1.03] starting:opacity-0 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            style={
              i === active && zoom
                ? {
                    transform: "scale(1.9)",
                    transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  }
                : undefined
            }
          />
        ))}

        {badge && (
          <span className="absolute start-4 top-4 z-10 rounded-full bg-[#68578b] px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {badge}
          </span>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="تصویر بعدی"
              onClick={() => go(active + 1)}
              className={`${arrow} left-3`}
              {...arrowGuard}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="تصویر قبلی"
              onClick={() => go(active - 1)}
              className={`${arrow} right-3`}
              {...arrowGuard}
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-4 end-4 z-10 rounded-full bg-black/45 px-3 py-1 text-xs tabular-nums text-white backdrop-blur">
              {faNum(active + 1)} از {faNum(count)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
