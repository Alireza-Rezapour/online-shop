"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE } from "./hero-config";
import type { HeroTextTone } from "./hero-types";

interface HeroControlsProps {
  onPrev: () => void;
  onNext: () => void;
  /** Follows the slide's text tone so the arrows stay visible on any photo. */
  tone: HeroTextTone;
}

/**
 * Two transparent outline arrows in the bottom corner. The hairline border and
 * icon use the slide's text colour, and they fill in on hover.
 */
export function HeroControls({ onPrev, onNext, tone }: HeroControlsProps) {
  const btn = cn(
    "grid size-6 place-items-center border bg-transparent backdrop-blur-[2px] md:size-11",
    "transition-colors duration-300",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
    TONE[tone].button,
  );

  return (
    <div
      className={cn(
        "absolute bottom-2 end-7 z-20 flex items-center gap-2 transition-colors duration-700 ",
        "md:bottom-10 md:end-12 md:gap-3",
        TONE[tone].text,
      )}
    >
      {/* RTL: the first button sits on the right, so it is "previous" */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="اسلاید قبلی"
        className={btn}
      >
        <ChevronRight className="size-3 md:size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="اسلاید بعدی"
        className={btn}
      >
        <ChevronLeft className="size-3 md:size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
