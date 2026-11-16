"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Search, User } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import SearchOverlay from "./SearchOverlay";
import Logo from "./Logo";
import CartPreview from "./CartPreview";
import Navigation from "./Navigation";

const iconBtn =
  "relative grid size-10 place-items-center rounded-full text-primary transition-colors duration-200 hover:bg-muted";

export default function Navbar() {
  const { data, isPending } = authClient.useSession();

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lastY = useRef(0);
  const ticking = useRef(false);

  // hide on scroll down, show on scroll up (rAF-throttled, with hysteresis)
  useEffect(() => {
    const update = () => {
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastY.current;
      setScrolled(y > 8);

      if (y < 120) {
        setHidden(false);
        lastY.current = y;
      } else if (delta > 8) {
        setHidden(true);
        lastY.current = y;
      } else if (delta < -8) {
        setHidden(false);
        lastY.current = y;
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "/" or Ctrl/⌘ + K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hide = hidden && !searchOpen && !menuOpen;
  const name = data?.user?.name ?? "";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 hidden transition-transform duration-300 ease-out motion-reduce:transition-none lg:block",
          hide && "-translate-y-full",
        )}
      >
        <div
          className={cn(
            "border-b transition-[background-color,box-shadow,border-color] duration-300",
            scrolled
              ? "border-muted/70 bg-background/80 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              : "border-transparent bg-background",
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-[92%] max-w-7xl items-center gap-8 transition-[height] duration-300 ease-out motion-reduce:transition-none lg:w-[88%]",
              scrolled ? "h-14" : "h-18",
            )}
          >
            <Logo />

            <Navigation onOpenChange={setMenuOpen} />

            <div className="ms-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="جستجو"
                className="group/search me-2 flex h-10 w-52 items-center gap-2.5 rounded-full border border-muted bg-muted/50 px-3.5 text-sm text-muted-foreground transition-[width,background-color,border-color] duration-300 hover:border-primary-foreground/40 hover:bg-background xl:w-72"
              >
                <Search className="size-4 shrink-0" />
                <span className="flex-1 truncate text-start">
                  جستجوی محصولات
                </span>
                <kbd className="hidden rounded border border-muted bg-background px-1.5 py-0.5 font-sans text-[10px] xl:block">
                  /
                </kbd>
              </button>

              <Link
                href="/favorites"
                aria-label="علاقه‌مندی‌ها"
                className={iconBtn}
              >
                <Heart className="size-5" strokeWidth={1.75} />
              </Link>

              <CartPreview />

              {isPending ? (
                <div className="ms-2 h-10 w-24 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              ) : data ? (
                <Link
                  href="/dashboard"
                  className="ms-2 flex h-10 items-center gap-2 rounded-full bg-primary-foreground pe-4 ps-1 text-sm text-secondary transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-secondary/20 text-sm font-medium">
                    {name.trim().charAt(0) || <User className="size-4" />}
                  </span>
                  <span className="max-w-32 truncate">{name}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="ms-2 flex h-10 items-center gap-2 rounded-full bg-primary-foreground px-4 text-sm text-secondary transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
                >
                  <User className="size-4" />
                  ورود
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
