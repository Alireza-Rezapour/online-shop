"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroContent } from "./hero-content";
import { HeroControls } from "./hero-controls";
import { HeroImage } from "./hero-image";
import {
  AUTOPLAY_MS,
  EASE_WIPE,
  HERO_HEIGHT,
  TONE,
  WIPE_S,
} from "./hero-config";
import type { HeroSlide } from "./hero-types";
import { useGetHeroSlidesQuery } from "@/redux/services/heroSlideApi";

/**
 * The new slide is revealed by a clip-path wipe that travels in the
 * reading direction (right to left for "next"), while the old photo
 * pushes back slightly underneath it.
 */
const imageVariants: Variants = {
  enter: (dir: 1 | -1) => ({
    clipPath: dir === 1 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
    zIndex: 2,
  }),
  center: {
    clipPath: "inset(0 0 0 0%)",
    zIndex: 2,
    transition: { duration: WIPE_S, ease: EASE_WIPE },
  },
  exit: {
    scale: 1.06,
    zIndex: 1,
    transition: { duration: WIPE_S, ease: EASE_WIPE },
  },
};

export function Hero() {
  const { data: slides, isLoading } = useGetHeroSlidesQuery();

  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const [nav, setNav] = useState<{ index: number; dir: 1 | -1 }>({
    index: 0,
    dir: 1,
  });

  const count = slides?.length;

  const step = useCallback(
    (d: 1 | -1) =>
      setNav((s) => ({
        index: (s.index + d + (count || 0)) % (count || 0),
        dir: d,
      })),
    [count],
  );

  const autoplay = (count || 0) > 1 && !reduceMotion;

  // Advances every AUTOPLAY_MS, restarts after any manual change, pauses on hover
  useEffect(() => {
    if (!autoplay || paused) return;
    const timer = setTimeout(() => step(1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [autoplay, paused, nav.index, step]);

  if (count === 0) return null;
  if (isLoading) return <Skeleton className={cn("w-full", HERO_HEIGHT)} />;
  if (!slides) return;

  const activeIndex = Math.min(nav.index, (count || 0) - 1);
  const active = slides[activeIndex];

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((count || 0) < 2) return;
    // RTL: the left arrow moves forward
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        aria-roledescription="carousel"
        aria-label="پیشنهادهای ویژه و کالکشن‌های جدید"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPanEnd={(_, info) => {
          if ((count || 0) < 2) return;
          const { x, y } = info.offset;
          if (Math.abs(x) < 60 || Math.abs(x) < Math.abs(y)) return;
          // Swiping left moves forward in RTL
          step(x < 0 ? 1 : -1);
        }}
        style={{ touchAction: "pan-y" }}
        className={cn(
          "relative w-full overflow-hidden bg-muted focus:outline-none",
          HERO_HEIGHT,
        )}
      >
        <AnimatePresence initial={false} custom={nav.dir}>
          <motion.div
            key={active.id}
            custom={nav.dir}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <HeroImage slide={active} priority={activeIndex === 0} />
          </motion.div>
        </AnimatePresence>

        {/* Hairline frame, inset from the photo edge. On desktop its top edge
            starts below the floating navbar (--hero-nav-offset). */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-3 z-10 transition-colors duration-700",
            "md:inset-x-5 md:bottom-5 md:top-[var(--hero-nav-offset,5.5rem)]",
            TONE[active.textTone].frame,
          )}
        />

        <AnimatePresence mode="wait">
          <HeroContent key={active.id} slide={active} />
        </AnimatePresence>

        {(count || 0) > 1 ? (
          <HeroControls
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            tone={active.textTone}
          />
        ) : null}
      </motion.section>
    </MotionConfig>
  );
}
