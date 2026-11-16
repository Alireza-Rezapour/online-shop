"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { usePresence } from "./usePresence";
import SearchPanel from "./SearchPanel";

/** Desktop search: a command-palette style panel. */
export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mounted, shown } = usePresence(open, 200);
  const lastFocus = useRef<HTMLElement | null>(null);

  // lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // give focus back to whatever opened the palette
  useEffect(() => {
    if (open) lastFocus.current = document.activeElement as HTMLElement | null;
    else lastFocus.current?.focus?.();
  }, [open]);

  if (!mounted) return null;

  // portal: the navbar has a transform, which would trap `position: fixed`
  return createPortal(
    <div
      className="fixed inset-0 z-100"
      role="dialog"
      aria-modal="true"
      aria-label="جستجو"
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative mx-auto mt-[10vh] w-[min(92vw,42rem)] overflow-hidden rounded-2xl border border-muted bg-background shadow-2xl transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
          shown
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-3 scale-[0.98] opacity-0",
        )}
      >
        <SearchPanel variant="overlay" onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
