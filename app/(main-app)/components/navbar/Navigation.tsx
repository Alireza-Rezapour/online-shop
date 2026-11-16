"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { useMegaMenu } from "@/app/hooks/useMegaMenu";
import { cn } from "@/lib/utils";
import { usePresence } from "./usePresence";

const OPEN_DELAY = 90;
const CLOSE_DELAY = 140;

type Timer = ReturnType<typeof setTimeout> | undefined;

export default function Navigation({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const megaMenu = useMegaMenu();
  const categories = megaMenu ?? [];

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const activeRef = useRef<string | null>(null);
  const openTimer = useRef<Timer>(undefined);
  const closeTimer = useRef<Timer>(undefined);

  const { mounted, shown } = usePresence(open, 180);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    [],
  );

  const cancelClose = () => clearTimeout(closeTimer.current);

  const scheduleClose = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  const closeNow = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    setOpen(false);
  };

  // hover-intent: a short delay on first open, instant when switching categories
  const openCategory = (id: string, immediate = false) => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    const run = () => {
      if (activeRef.current !== id) {
        activeRef.current = id;
        setSectionIndex(0);
      }
      setActiveId(id);
      setOpen(true);
    };
    if (immediate || open) run();
    else openTimer.current = setTimeout(run, OPEN_DELAY);
  };

  const activeCategory = categories.find((c) => c.id === activeId);
  const section =
    activeCategory?.sections[sectionIndex] ?? activeCategory?.sections[0];

  return (
    <nav
      aria-label="دسته‌بندی‌ها"
      className="self-stretch"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      onKeyDown={(e) => e.key === "Escape" && closeNow()}
    >
      <ul className="flex h-full items-stretch">
        {categories.map((cat) => {
          const hasMenu = cat.sections?.length > 0;
          const isOpen = open && activeId === cat.id;
          return (
            <li key={cat.id} className="flex">
              <Link
                href={`/categories/${cat.slug}`}
                aria-haspopup={hasMenu || undefined}
                aria-expanded={hasMenu ? isOpen : undefined}
                onClick={closeNow}
                onMouseEnter={() =>
                  hasMenu ? openCategory(cat.id) : scheduleClose()
                }
                onFocus={() => hasMenu && openCategory(cat.id, true)}
                className={cn(
                  "relative flex items-center px-3.5 text-[15px] text-primary transition-colors duration-200",
                  "after:absolute after:inset-x-3.5 after:bottom-3 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-primary-foreground after:transition-transform after:duration-300 after:ease-out motion-reduce:after:transition-none",
                  "hover:after:scale-x-100 focus-visible:after:scale-x-100",
                  isOpen && "text-primary-foreground after:scale-x-100",
                )}
              >
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {mounted && activeCategory && section && (
        <div
          className={cn(
            "absolute inset-x-0 top-full transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            shown
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0",
          )}
        >
          <div className="border-b border-muted/70 bg-background/95 shadow-[0_28px_40px_-28px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mx-auto grid max-h-[70vh] w-[92%] max-w-7xl grid-cols-[15rem_1fr] gap-10 overflow-y-auto py-8 lg:w-[88%]">
              {/* sections rail */}
              <div className="flex flex-col gap-1">
                {activeCategory.sections.map((s, i) => {
                  const isActive = i === sectionIndex;
                  return (
                    <Link
                      key={s.id}
                      href={`/categories/${s.slug}`}
                      onClick={closeNow}
                      onMouseEnter={() => setSectionIndex(i)}
                      onFocus={() => setSectionIndex(i)}
                      className={cn(
                        "group/section relative flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors duration-200",
                        isActive
                          ? "bg-primary-foreground/10 font-medium text-primary-foreground"
                          : "text-primary hover:bg-muted",
                      )}
                    >
                      {s.name}
                      <ChevronLeft
                        className={cn(
                          "size-4 transition-all duration-200",
                          isActive
                            ? "-translate-x-1 opacity-100"
                            : "opacity-0 group-hover/section:opacity-60",
                        )}
                      />
                    </Link>
                  );
                })}
                <Link
                  href={`/categories/${activeCategory.slug}`}
                  onClick={closeNow}
                  className="mt-3 px-4 text-sm text-primary-foreground underline-offset-4 hover:underline"
                >
                  همه محصولات {activeCategory.name}
                </Link>
              </div>

              {/* items */}
              <div>
                <div className="mb-4 flex items-baseline justify-between border-b border-muted/70 pb-3">
                  <h3 className="text-lg font-medium text-primary">
                    {section.name}
                  </h3>
                  <Link
                    href={`/categories/${section.slug}`}
                    onClick={closeNow}
                    className="text-sm text-primary-foreground underline-offset-4 hover:underline"
                  >
                    مشاهده همه
                  </Link>
                </div>
                <ul className="grid grid-cols-3 gap-x-4 gap-y-1 xl:grid-cols-4">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/categories/${item.slug}`}
                        onClick={closeNow}
                        className="block rounded-lg px-3 py-2 text-sm text-primary/90 transition-colors duration-150 hover:bg-muted hover:text-primary-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
