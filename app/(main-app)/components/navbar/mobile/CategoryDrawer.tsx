"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, ChevronLeft, X } from "lucide-react";

import { useMegaMenu } from "@/app/hooks/useMegaMenu";
import { cn } from "@/lib/utils";
import { usePresence } from "../usePresence";

export default function CategoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const menu = useMegaMenu();
  const categories = (menu ?? []).toReversed();

  const { mounted, shown } = usePresence(open, 280);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const active = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  // open the first section of the category by default
  useEffect(() => {
    if (open) setOpenSection(active?.sections[0]?.slug ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active?.slug]);

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
      aria-label="دسته‌بندی‌ها"
      className={cn(
        "fixed inset-0 z-110 flex h-dvh flex-col bg-background transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      <div className="flex items-center justify-between border-b border-muted/70 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <h2 className="text-base font-medium text-primary">دسته‌بندی‌ها</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="grid size-10 place-items-center rounded-full text-primary transition-colors hover:bg-muted"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[7.5rem_1fr] sm:grid-cols-[10rem_1fr]">
        {/* parent categories */}
        <div
          role="tablist"
          aria-orientation="vertical"
          className="overflow-y-auto bg-muted/50 py-2 pb-[env(safe-area-inset-bottom)]"
        >
          {categories.map((c) => {
            const isActive = c.slug === active?.slug;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSlug(c.slug)}
                className={cn(
                  "relative flex w-full items-center justify-between gap-1 px-3 py-4 text-start text-sm transition-colors duration-200",
                  isActive
                    ? "bg-background font-medium text-primary-foreground"
                    : "text-primary/80",
                )}
              >
                {isActive && (
                  <span className="absolute inset-y-3 start-0 w-[3px] rounded-full bg-primary-foreground" />
                )}
                <span>{c.name}</span>
                <ChevronLeft
                  className={cn(
                    "size-4 shrink-0 transition-opacity",
                    isActive ? "opacity-100" : "opacity-40",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* sections + items */}
        <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
          {active && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-medium text-primary">
                  {active.name}
                </h3>
                <Link
                  href={`/categories/${active.slug}`}
                  onClick={onClose}
                  className="text-xs text-primary-foreground underline underline-offset-4"
                >
                  مشاهده همه
                </Link>
              </div>

              <ul className="divide-y divide-muted/60">
                {active.sections.map((s) => {
                  const isOpen = openSection === s.slug;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenSection((prev) =>
                            prev === s.slug ? null : s.slug,
                          )
                        }
                        className={cn(
                          "flex w-full items-center justify-between py-3.5 text-sm transition-colors",
                          isOpen ? "text-primary-foreground" : "text-primary",
                        )}
                      >
                        {s.name}
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-300",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>

                      {/* smooth height via grid-rows */}
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <div className="overflow-hidden">
                          <div
                            className={cn(
                              "grid grid-cols-2 gap-2 pb-4 transition-opacity duration-300",
                              isOpen ? "opacity-100" : "opacity-0",
                            )}
                          >
                            <Link
                              href={`/categories/${s.slug}`}
                              onClick={onClose}
                              tabIndex={isOpen ? 0 : -1}
                              className="col-span-2 text-xs text-primary-foreground underline underline-offset-4"
                            >
                              مشاهده همه {s.name}
                            </Link>
                            {s.items.map((item) => (
                              <Link
                                key={item.id}
                                href={`/categories/${item.slug}`}
                                onClick={onClose}
                                tabIndex={isOpen ? 0 : -1}
                                className="rounded-xl border border-muted px-3 py-2.5 text-center text-[13px] text-primary transition-colors active:bg-muted"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
