"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LookDto } from "@/services/look/look.types";
import { LookCarouselControls } from "./look-carousel-controls";
import { LookShopLink, LookSlide } from "./look-slide";

type Props = {
  looks: LookDto[];
  /** Override the height, e.g. inside a dialog (default: the whole viewport) */
  className?: string;
};

const SLIDE_OFFSET = 40; // px a neighbouring slide waits to the side

/**
 * The section is exactly one viewport tall (small-viewport units, so mobile
 * browser bars never push the controls out of sight). Set
 * --site-header-height on :root if a sticky header sits above it.
 */
export function ShopTheLook({ looks, className }: Props) {
  const count = looks.length;
  const multiple = count > 1;

  const [index, setIndex] = useState(0);
  const [rtl, setRtl] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (sectionRef.current) {
      setRtl(getComputedStyle(sectionRef.current).direction === "rtl");
    }
  }, []);

  const goTo = useCallback(
    (i: number) => setIndex(Math.min(Math.max(i, 0), count - 1)),
    [count],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // In RTL the next slide is to the left, so swiping right (and ArrowLeft) means "next"
  const handleSwipe = (direction: "left" | "right") =>
    (direction === "right") === rtl ? next() : prev();

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!multiple) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    (e.key === "ArrowLeft") === rtl ? next() : prev();
  };

  // Neighbours stay mounted (images already loaded, no flash) and fade/slide
  const sign = rtl ? -1 : 1;
  const current = looks[index];

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="ست‌های منتخب"
      tabIndex={multiple ? 0 : -1}
      onKeyDown={handleKeyDown}
      className={cn(
        "h-[calc(100svh-var(--site-header-height,0px))] min-h-[32rem] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        className,
      )}
    >
      <h2 className="sr-only">خرید ست کامل</h2>

      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-3 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:gap-5 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="relative min-h-0 flex-1">
          {looks.map((look, i) => {
            if (Math.abs(i - index) > 1) return null;
            const isActive = i === index;
            return (
              <motion.div
                key={look.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${(i + 1).toLocaleString("fa-IR")} از ${count.toLocaleString("fa-IR")}`}
                aria-hidden={!isActive}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  x: isActive ? 0 : Math.sign(i - index) * SLIDE_OFFSET * sign,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                }
                className={cn("absolute inset-0", !isActive && "pointer-events-none")}
              >
                <LookSlide
                  look={look}
                  index={i}
                  count={count}
                  isActive={isActive}
                  swipeable={multiple}
                  onSwipe={handleSwipe}
                />
              </motion.div>
            );
          })}
        </div>

        <LookCarouselControls index={index} count={count} onPrev={prev} onNext={next}>
          {current && <LookShopLink look={current} className="flex-1 lg:hidden" />}
        </LookCarouselControls>
      </div>

      <p className="sr-only" aria-live="polite">
        ست {(index + 1).toLocaleString("fa-IR")} از {count.toLocaleString("fa-IR")}: {current?.title}
      </p>
    </section>
  );
}
