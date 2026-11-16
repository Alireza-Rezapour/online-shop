"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  LayoutGrid,
  Loader2,
  Search,
  X,
} from "lucide-react";

import { useMegaMenu } from "@/app/hooks/useMegaMenu";
import { cn, formatPrice } from "@/lib/utils";
import type { StoreProductCardDto } from "@/services/product/store-product.service";
import MyImage from "../MyImage";
import { useLazyGetStoreProductsQuery } from "@/redux/services/storeProductApi";

const RECENT_KEY = "roze:recent-searches";
const MAX_RECENT = 6;
const MIN_CHARS = 2;
const PAGE_SIZE = 6; // fetch one more than we show, so we know whether to offer "see all"
const SHOWN = 5;
const DEBOUNCE_MS = 250;
const LIST_ID = "roze-search-list";

type Entry = {
  index: number;
  id: string;
  kind: "query" | "category" | "product" | "recent" | "all";
  label: string;
  href: string;
  hint?: string;
  product?: StoreProductCardDto;
};

type Section = {
  id: string;
  title?: string;
  chips?: boolean;
  onClear?: () => void;
  entries: Entry[];
};

/* ---------- helpers ---------- */

// Persian-friendly folding: Arabic ي/ك -> ی/ک, ZWNJ -> space, case-insensitive.
const fold = (s: string) =>
  s
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .toLowerCase();

const searchHref = (v: string) => `/search?v=${encodeURIComponent(v)}`;
const categoryHref = (slug: string) => `/categories/${slug}`;
// NOTE: your cart linked to /product/ and search to /products/ — keep only the right one.
const productHref = (slug: string) => `/products/${slug}`;

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function writeRecents(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = fold(query.trim());
  if (!q) return <>{text}</>;
  const i = fold(text).indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-primary-foreground">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

const kbd =
  "rounded border border-muted bg-muted/50 px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground";

/* ---------- component ---------- */

export default function SearchPanel({
  variant,
  onClose,
}: {
  variant: "overlay" | "drawer";
  onClose: () => void;
}) {
  const router = useRouter();
  const menu = useMegaMenu();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(-1);
  const [recents, setRecents] = useState<string[]>([]);

  const [triggerSearch, { data, isFetching, isError, originalArgs }] =
    useLazyGetStoreProductsQuery();

  const q = query.trim();
  const wantsProducts = q.length >= MIN_CHARS;

  /* mount: load recents + focus */
  useEffect(() => {
    setRecents(readRecents());
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  /* debounce -> fetch (cached results are reused) */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (debounced.length >= MIN_CHARS)
      triggerSearch({ search: debounced, pageSize: PAGE_SIZE }, true);
  }, [debounced, triggerSearch]);

  const requested =
    typeof originalArgs === "object" ? originalArgs?.search : undefined;
  const settled =
    wantsProducts && debounced === q && !isFetching && requested === q;
  const failed = wantsProducts && debounced === q && !isFetching && isError;
  const waiting = wantsProducts && !settled && !failed;

  const products = useMemo(
    () => (wantsProducts && data ? data.items : []),
    [data, wantsProducts],
  );
  const totalProducts = wantsProducts && data ? data.total : 0;

  /* flat list of every category / section / item for suggestions */
  const { topLevel, nested } = useMemo(() => {
    const top: { id: string; name: string; slug: string; parent?: string }[] =
      [];
    const sub: typeof top = [];
    (menu ?? []).forEach((c) => {
      top.push({ id: c.id, name: c.name, slug: c.slug });
      c.sections.forEach((s) => {
        sub.push({ id: s.id, name: s.name, slug: s.slug, parent: c.name });
        s.items.forEach((i) =>
          sub.push({ id: i.id, name: i.name, slug: i.slug, parent: s.name }),
        );
      });
    });
    return { topLevel: top, nested: sub };
  }, [menu]);

  /* recents */
  const remember = useCallback((term: string) => {
    setRecents((prev) => {
      const next = [term, ...prev.filter((r) => r !== term)].slice(
        0,
        MAX_RECENT,
      );
      writeRecents(next);
      return next;
    });
  }, []);

  const forget = useCallback((term: string) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r !== term);
      writeRecents(next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    writeRecents([]);
  }, []);

  /* sections, with a running index for keyboard navigation */
  const { sections, flat } = useMemo(() => {
    let n = 0;
    const mk = (e: Omit<Entry, "index">): Entry => ({ ...e, index: n++ });
    const out: Section[] = [];

    if (!q) {
      if (recents.length) {
        out.push({
          id: "recent",
          title: "جستجوهای اخیر",
          onClear: clearRecents,
          entries: recents.map((r) =>
            mk({ id: `r-${r}`, kind: "recent", label: r, href: searchHref(r) }),
          ),
        });
      }
      const popular = [...topLevel, ...nested].slice(0, 8);
      if (popular.length) {
        out.push({
          id: "popular",
          title: "دسته‌بندی‌ها",
          chips: true,
          entries: popular.map((c) =>
            mk({
              id: `p-${c.id}`,
              kind: "category",
              label: c.name,
              href: categoryHref(c.slug),
            }),
          ),
        });
      }
    } else {
      const needle = fold(q);
      const hits = [...topLevel, ...nested]
        .map((c) => ({ c, pos: fold(c.name).indexOf(needle) }))
        .filter((x) => x.pos >= 0)
        .sort((a, b) => a.pos - b.pos)
        .slice(0, 4)
        .map((x) => x.c);

      out.push({
        id: "suggest",
        entries: [
          mk({ id: "q", kind: "query", label: q, href: searchHref(q) }),
          ...hits.map((c) =>
            mk({
              id: `c-${c.id}`,
              kind: "category",
              label: c.name,
              href: categoryHref(c.slug),
              hint: c.parent,
            }),
          ),
        ],
      });

      if (products.length) {
        const entries = products.slice(0, SHOWN).map((p) =>
          mk({
            id: `pr-${p.slug}`,
            kind: "product",
            label: p.title,
            href: productHref(p.slug),
            product: p,
          }),
        );
        if (totalProducts > SHOWN) {
          entries.push(
            mk({
              id: "all",
              kind: "all",
              label: `مشاهده همه ${totalProducts} نتیجه`,
              href: searchHref(q),
            }),
          );
        }
        out.push({ id: "products", title: "محصولات", entries });
      }
    }

    return { sections: out, flat: out.flatMap((s) => s.entries) };
  }, [q, recents, topLevel, nested, products, totalProducts, clearRecents]);

  /* keep the active row visible while arrowing */
  useEffect(() => {
    if (active < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  /* actions */
  const choose = (entry: Entry) => {
    const term = entry.kind === "recent" ? entry.label : q;
    if (term.length >= MIN_CHARS) remember(term);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const total = flat.length;
    if (e.key === "ArrowDown" && total) {
      e.preventDefault();
      setActive((i) => (i + 1) % total);
    } else if (e.key === "ArrowUp" && total) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? total - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = flat[active] ?? flat.find((x) => x.kind === "query");
      if (entry) {
        choose(entry);
        router.push(entry.href);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const onChange = (v: string) => {
    setQuery(v);
    setActive(v.trim() ? 0 : -1);
  };

  /* ---------- render ---------- */

  const renderRow = (entry: Entry) => {
    const isActive = active === entry.index;
    const common = {
      id: `roze-opt-${entry.index}`,
      role: "option" as const,
      "aria-selected": isActive,
      "data-index": entry.index,
      onMouseMove: () => active !== entry.index && setActive(entry.index),
      onClick: () => choose(entry),
    };

    if (entry.kind === "product" && entry.product) {
      const p = entry.product;
      return (
        <Link
          key={entry.id}
          href={entry.href}
          {...common}
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 transition-colors",
            isActive && "bg-muted",
          )}
        >
          <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
            {p.coverImage && <MyImage src={p.coverImage} alt="" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-primary">
              <Highlight text={p.title} query={q} />
            </span>
            <span className="mt-1 flex items-center gap-2 text-xs">
              {p.salePrice ? (
                <>
                  <span className="font-medium text-primary-foreground">
                    {formatPrice(p.salePrice, "تومان")}
                  </span>
                  <s className="text-muted-foreground">
                    {formatPrice(p.basePrice, "تومان")}
                  </s>
                </>
              ) : (
                <span className="text-muted-foreground">
                  {formatPrice(p.basePrice, "تومان")}
                </span>
              )}
            </span>
          </span>
          <ChevronLeft
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-all duration-200",
              isActive ? "-translate-x-0.5 opacity-100" : "opacity-0",
            )}
          />
        </Link>
      );
    }

    if (entry.kind === "recent") {
      return (
        <div key={entry.id} className="group/recent relative">
          <Link
            href={entry.href}
            {...common}
            className={cn(
              "flex items-center gap-3 rounded-xl py-2.5 pe-11 ps-3 text-sm text-primary transition-colors",
              isActive && "bg-muted",
            )}
          >
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{entry.label}</span>
          </Link>
          <button
            type="button"
            aria-label={`حذف «${entry.label}» از جستجوهای اخیر`}
            onClick={() => forget(entry.label)}
            className="absolute end-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-primary"
          >
            <X className="size-3.5" />
          </button>
        </div>
      );
    }

    if (entry.kind === "all") {
      return (
        <Link
          key={entry.id}
          href={entry.href}
          {...common}
          className={cn(
            "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-primary-foreground transition-colors",
            isActive && "bg-muted",
          )}
        >
          {entry.label}
          <ChevronLeft className="size-4" />
        </Link>
      );
    }

    // "query" and "category"
    const isQuery = entry.kind === "query";
    return (
      <Link
        key={entry.id}
        href={entry.href}
        {...common}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary transition-colors",
          isActive && "bg-muted",
        )}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-primary-foreground">
          {isQuery ? (
            <Search className="size-4" />
          ) : (
            <LayoutGrid className="size-4" />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {isQuery ? (
            <>
              جستجوی «<span className="font-medium">{entry.label}</span>»
            </>
          ) : (
            <Highlight text={entry.label} query={q} />
          )}
        </span>
        {entry.hint && (
          <span className="shrink-0 text-xs text-muted-foreground">
            در {entry.hint}
          </span>
        )}
      </Link>
    );
  };

  const renderChip = (entry: Entry) => (
    <Link
      key={entry.id}
      href={entry.href}
      id={`roze-opt-${entry.index}`}
      role="option"
      aria-selected={active === entry.index}
      data-index={entry.index}
      onMouseMove={() => active !== entry.index && setActive(entry.index)}
      onClick={() => choose(entry)}
      className={cn(
        "rounded-full border border-muted px-3.5 py-1.5 text-sm text-primary transition-colors",
        active === entry.index &&
          "border-primary-foreground/50 bg-primary-foreground/10 text-primary-foreground",
      )}
    >
      {entry.label}
    </Link>
  );

  return (
    <div
      className={cn(
        "flex flex-col",
        variant === "overlay" ? "max-h-[min(78vh,40rem)]" : "h-full",
      )}
    >
      {/* input */}
      <div
        className={cn(
          "flex items-center gap-3",
          variant === "overlay"
            ? "border-b border-muted/70 px-4 py-3.5"
            : "px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3",
            variant === "drawer" &&
              "h-12 rounded-full bg-muted/60 px-4 focus-within:ring-2 focus-within:ring-primary-foreground/40",
          )}
        >
          {isFetching ? (
            <Loader2 className="size-5 shrink-0 animate-spin text-primary-foreground motion-reduce:animate-none" />
          ) : (
            <Search className="size-5 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            role="combobox"
            aria-expanded="true"
            aria-controls={LIST_ID}
            aria-autocomplete="list"
            aria-activedescendant={
              active >= 0 && flat[active] ? `roze-opt-${active}` : undefined
            }
            placeholder="نام محصول یا دسته‌بندی را بنویسید"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-primary outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="پاک کردن"
              onClick={() => {
                setQuery("");
                setActive(-1);
                inputRef.current?.focus();
              }}
              className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-primary"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {variant === "drawer" ? (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 px-1 text-sm text-primary-foreground"
          >
            انصراف
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن جستجو"
            className={cn(kbd, "hidden shrink-0 sm:block")}
          >
            Esc
          </button>
        )}
      </div>

      {/* results */}
      <div
        ref={listRef}
        id={LIST_ID}
        role="listbox"
        aria-label="نتایج جستجو"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3 pt-1"
      >
        {sections.map((section) => (
          <div
            key={section.id}
            className={cn(
              "mb-1",
              section.id === "products" &&
                waiting &&
                "opacity-50 transition-opacity",
            )}
          >
            {section.title && (
              <div className="flex items-center justify-between px-3 pb-1.5 pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {section.title}
                </p>
                {section.onClear && (
                  <button
                    type="button"
                    onClick={section.onClear}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    پاک کردن همه
                  </button>
                )}
              </div>
            )}
            {section.chips ? (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {section.entries.map(renderChip)}
              </div>
            ) : (
              section.entries.map(renderRow)
            )}
          </div>
        ))}

        {waiting && products.length === 0 && (
          <div className="px-1 pt-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-14 w-11 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </div>
        )}

        {settled && products.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-primary">برای «{q}» محصولی پیدا نشد.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              املای کلمه را بررسی کنید یا از دسته‌بندی‌ها شروع کنید.
            </p>
          </div>
        )}

        {failed && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-primary">جستجو انجام نشد.</p>
            <button
              type="button"
              onClick={() => triggerSearch({ search: q, pageSize: PAGE_SIZE })}
              className="mt-2 text-sm text-primary-foreground underline underline-offset-4"
            >
              تلاش دوباره
            </button>
          </div>
        )}
      </div>

      {variant === "overlay" && (
        <div className="hidden items-center gap-5 border-t border-muted/70 px-4 py-2.5 text-xs text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5">
            <kbd className={kbd}>↑</kbd>
            <kbd className={kbd}>↓</kbd>
            انتخاب
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className={kbd}>Enter</kbd>
            باز کردن
          </span>
        </div>
      )}
    </div>
  );
}
