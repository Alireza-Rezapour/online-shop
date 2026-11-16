"use client";

import { useState } from "react";
import { Crosshair, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FocalPointPickerProps {
  src: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/**
 * Click the part of the photo that must always stay visible (a face, the
 * garment). The storefront uses it as object-position when cropping.
 */
export function FocalPointPicker({ src, x, y, onChange }: FocalPointPickerProps) {
  // A failed src is remembered, and clears itself when the src changes
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const broken = failedSrc === src;

  if (!src.trim() || broken) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground">
        <ImageOff className="size-5" aria-hidden="true" />
        {broken ? "تصویر بارگذاری نشد" : "ابتدا آدرس تصویر را وارد کنید"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-center rounded-md border bg-muted p-2">
        <div
          className="relative inline-block cursor-crosshair"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onChange(
              clamp(((e.clientX - rect.left) / rect.width) * 100),
              clamp(((e.clientY - rect.top) / rect.height) * 100),
            );
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            onError={() => setFailedSrc(src)}
            className="block max-h-72 w-auto select-none"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ring-1 ring-black/50"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Crosshair className="size-3.5" aria-hidden="true" />
          روی نقطه‌ی مهم تصویر کلیک کنید
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(50, 50)}
        >
          بازنشانی به مرکز
        </Button>
      </div>
    </div>
  );
}
