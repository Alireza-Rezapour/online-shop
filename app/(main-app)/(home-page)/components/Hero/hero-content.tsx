"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT, TONE, placement } from "./hero-config";
import type { HeroSlide } from "./hero-types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

// Each title line slides up out of its own mask
const lineReveal: Variants = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 0.85, ease: EASE_OUT } },
};

function resolveHref(slide: HeroSlide): string | null {
  if (!slide.ctaType || !slide.ctaSlug) return null;
  switch (slide.ctaType) {
    case "PRODUCT":
      return `/products/${slide.ctaSlug}`;
    case "COLLECTION":
      return `/collections/${slide.ctaSlug}`;
    case "CATEGORY":
      return `/categories/${slide.ctaSlug}`;
    default:
      return null;
  }
}

export function HeroContent({ slide }: { slide: HeroSlide }) {
  const tone = TONE[slide.textTone];
  const { wrap, inner } = placement(
    slide.mobilePosition,
    slide.desktopPosition,
  );
  const lines = slide.title.split("\n");
  const href = resolveHref(slide);

  return (
    // dir="ltr" so LEFT / CENTER / RIGHT mean the physical sides the admin picked
    <div
      dir="ltr"
      className={cn(
        // Desktop top padding clears the floating navbar (--hero-nav-offset)
        "pointer-events-none absolute inset-0 z-10 flex px-8 pb-14 pt-7 md:px-20 md:pb-24 md:pt-[calc(var(--hero-nav-offset,5.5rem)+1.5rem)]",
        tone.text,
        wrap,
      )}
    >
      <motion.div
        dir="rtl"
        variants={container}
        initial="hidden"
        animate="show"
        exit="exit"
        className={cn(
          "pointer-events-auto flex w-full max-w-136 flex-col gap-2 md:gap-5",
          inner,
        )}
      >
        {slide.eyebrow ? (
          <motion.div
            variants={rise}
            className="flex items-center gap-3 text-xs md:text-sm"
          >
            <span aria-hidden="true" className="h-px w-8 bg-current md:w-12" />
            {slide.eyebrow}
          </motion.div>
        ) : null}

        <h1 className="text-[1.375rem] font-bold leading-[1.25] sm:text-3xl md:text-5xl md:leading-[1.2] lg:text-[3.75rem]">
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden py-1">
              <motion.span
                variants={lineReveal}
                className={cn(
                  "block",
                  // On multi-line titles the last line is set lighter
                  lines.length > 1 && i === lines.length - 1 && "font-light",
                )}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        {slide.description ? (
          <motion.p
            variants={rise}
            className="hidden line-clamp-2 max-w-md text-xs leading-6 opacity-90 sm:block sm:text-sm md:text-base md:leading-8"
          >
            {slide.description}
          </motion.p>
        ) : null}

        {slide.ctaLabel && href ? (
          <motion.div variants={rise} className="pt-1 md:pt-2">
            <Link
              href={href}
              className={cn(
                "inline-flex h-9 items-center border bg-transparent px-5 text-xs font-medium",
                "transition-colors duration-300 md:h-12 md:px-9 md:text-sm",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current",
                tone.button,
              )}
            >
              {slide.ctaLabel}
            </Link>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
