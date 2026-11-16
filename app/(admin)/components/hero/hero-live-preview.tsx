"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { HeroSlide } from "./hero-types";
import { PreviewBoundary } from "./preview-boundary";
import { Hero } from "@/app/(main-app)/(home-page)/components/Hero/hero";

/** The storefront hero is laid out for a wide desktop screen; we render it at this width and scale it down. */
const DESIGN_WIDTH = 1440;

function ScaledStage({ slide }: { slide: HeroSlide }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ scale: 0.6, height: 0 });

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // Fires once when observing starts, then on every size change
    const observer = new ResizeObserver(() => {
      setSize({
        scale: outer.clientWidth / DESIGN_WIDTH,
        height: inner.offsetHeight,
      });
    });
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className="relative w-full overflow-hidden rounded-md border bg-muted"
      style={{ height: size.height * size.scale || 160 }}
    >
      <div
        ref={innerRef}
        dir="rtl"
        className="absolute right-0 top-0 origin-top-right"
        style={{ width: DESIGN_WIDTH, transform: `scale(${size.scale})` }}
        // Links in the preview must not navigate away from the form
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest("a")) e.preventDefault();
        }}
      >
        <div className="relative">
          {/* <PreviewBoundary resetKey={`${slide.image}|${slide.mobileImage}`}>
            <Hero slides={[slide]} />
          </PreviewBoundary> */}

          {/* Where the floating navbar will sit; text and frame stay below it */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[var(--hero-nav-offset,5.5rem)] items-center justify-center border-b border-dashed border-white/70 bg-black/10 text-lg text-white"
          >
            ناحیه‌ی نوار ناوبری
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroLivePreview({ slide }: { slide: HeroSlide | null }) {
  if (!slide) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground">
        <ImageIcon className="size-5" aria-hidden="true" />
        برای دیدن پیش‌نمایش، آدرس تصویر را وارد کنید
      </div>
    );
  }
  return <ScaledStage slide={slide} />;
}
