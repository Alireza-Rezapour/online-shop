"use client";

import { getImageProps } from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT, TONE } from "./hero-config";
import type { HeroSlide } from "./hero-types";
import { getPublicUrl } from "@/services/storage/storage.public-url";

interface HeroImageProps {
  slide: HeroSlide;
  priority?: boolean;
}

/**
 * Uses <picture> (via getImageProps) so mobile gets its own crop
 * without downloading the desktop file, and vice versa.
 */
export function HeroImage({ slide, priority }: HeroImageProps) {
  const alt = slide.imageAlt || slide.title.replace(/\n/g, " ");
  const common = { alt, fill: true, sizes: "100vw", quality: 80, priority };

  const desktopSrc = getPublicUrl(slide.image);
  const mobileSrc = getPublicUrl(slide.mobileImage) ?? desktopSrc;

  const desktop = getImageProps({ ...common, src: desktopSrc! });
  const mobile = getImageProps({
    ...common,
    src: mobileSrc || desktopSrc!,
  });

  console.log(desktopSrc);

  const { srcSet: desktopSet } = desktop.props;
  const { srcSet: mobileSet, style, ...img } = mobile.props;

  return (
    <div className="absolute inset-0 overflow-hidden bg-muted">
      {/* Slow settle: the photo eases back from a slight zoom */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 9, ease: EASE_OUT }}
      >
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={desktopSet}
            sizes="100vw"
          />
          <source media="(max-width: 767px)" srcSet={mobileSet} sizes="100vw" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...img}
            alt={alt}
            style={{
              ...style,
              objectFit: "cover",
              objectPosition: `${slide.focalX}% ${slide.focalY}%`,
            }}
          />
        </picture>
      </motion.div>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          TONE[slide.textTone].scrim,
        )}
      />
    </div>
  );
}
