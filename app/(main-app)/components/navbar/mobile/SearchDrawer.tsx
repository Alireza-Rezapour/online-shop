"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import SearchPanel from "../SearchPanel";
import { usePresence } from "../usePresence";

/** Mobile search: full-screen sheet using the same autosuggest panel as desktop. */
export default function SearchDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mounted, shown } = usePresence(open, 250);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="جستجو"
      className={cn(
        "fixed inset-0 z-110 h-dvh bg-background transition-[opacity,transform] duration-250 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <SearchPanel variant="drawer" onClose={onClose} />
    </div>,
    document.body,
  );
}
