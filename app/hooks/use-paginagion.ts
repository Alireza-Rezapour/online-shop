"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface UsePaginationOptions {
  pageSize: number;
}

interface UsePaginationResult<T> {
  page: number;
  setPage: (page: number) => void;
  pageCount: number;
  pageItems: T[];
  /** Attach to the wrapper around the list. Scrolled into view on page change. */
  topRef: React.RefObject<HTMLDivElement | null>;
}

export function usePagination<T>(
  items: T[],
  { pageSize }: UsePaginationOptions,
): UsePaginationResult<T> {
  const [page, setPageState] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  // Only true right after setPage() was actually called — never true on
  // mount, and not something an effect running twice in Strict Mode can
  // accidentally flip. That's what makes "don't scroll on load" reliable.
  const shouldScrollRef = useRef(false);

  // Reset to page 1 when `items` changes (new sort/filter results). This is
  // React's recommended "adjust state when a prop changes" pattern — done
  // with useState (safe to read during render), not useRef.
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    if (page !== 1) setPageState(1);
  }

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  function setPage(next: number) {
    shouldScrollRef.current = true;
    setPageState(next);
  }

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const pageStart = (page - 1) * pageSize;
  const pageItems = useMemo(
    () => items.slice(pageStart, pageStart + pageSize),
    [items, pageStart, pageSize],
  );

  return { page, setPage, pageCount, pageItems, topRef };
}
