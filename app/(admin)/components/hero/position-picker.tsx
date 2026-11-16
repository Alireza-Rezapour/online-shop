"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HeroContentPosition } from "./hero-types";
import {
  HERO_POSITION_GRID,
  HERO_POSITION_LABELS,
} from "../../lib/hero/hero-labels";

interface PositionPickerProps {
  label: string;
  value: HeroContentPosition;
  onChange: (value: HeroContentPosition) => void;
}

/** 3x3 grid. dir="ltr" keeps "left" on the physical left, like the storefront. */
export function PositionPicker({
  label,
  value,
  onChange,
}: PositionPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        dir="ltr"
        role="radiogroup"
        aria-label={label}
        className="grid w-44 grid-cols-3 gap-1 rounded-md border bg-muted/40 p-1.5"
      >
        {HERO_POSITION_GRID.map((position) => {
          const selected = position === value;
          return (
            <button
              key={position}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={HERO_POSITION_LABELS[position]}
              onClick={() => onChange(position)}
              className={cn(
                "grid aspect-16/10 place-items-center rounded-sm border border-transparent bg-background transition-colors",
                "hover:border-ring focus-visible:outline-2 focus-visible:outline-ring",
                selected && "bg-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full bg-muted-foreground/40",
                  selected && "bg-background",
                )}
              />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {HERO_POSITION_LABELS[value]}
      </p>
    </div>
  );
}
