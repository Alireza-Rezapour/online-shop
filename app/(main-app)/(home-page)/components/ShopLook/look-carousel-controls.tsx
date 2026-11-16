"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  /** Mobile only: the shop action sits next to the arrows */
  children?: ReactNode;
};

const fa = (n: number) => n.toLocaleString("fa-IR", { minimumIntegerDigits: 2 });

const buttonClass =
  "flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40";

/**
 * One fixed-height bar under the slide.
 * Mobile: [ shop action ........ prev next ]
 * Desktop: [ 01 / 03 ——— progress ........ prev next ]
 */
export function LookCarouselControls({ index, count, onPrev, onNext, children }: Props) {
  const multiple = count > 1;

  return (
    <div
      className={`flex h-12 shrink-0 items-center gap-3 lg:justify-between ${
        multiple ? "" : "lg:hidden"
      }`}
    >
      {multiple && (
        <div className="hidden items-center gap-4 lg:flex" aria-hidden>
          <span className="text-sm tabular-nums">
            {fa(index + 1)} / {fa(count)}
          </span>
          <div className="h-0.5 w-40 bg-border">
            <motion.div
              className="h-full bg-primary"
              initial={false}
              animate={{ width: `${((index + 1) / count) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {children}

      {multiple && (
        <div className="flex gap-2">
          {/* In RTL the chevrons flip so "previous" points to the right */}
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            aria-label="ست قبلی"
            className={buttonClass}
          >
            <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index === count - 1}
            aria-label="ست بعدی"
            className={buttonClass}
          >
            <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
