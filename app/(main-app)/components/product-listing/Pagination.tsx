"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageItems(page: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | string)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) items.push("ellipsis-start");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis-end");
  items.push(total);

  return items;
}

const arrow =
  "flex h-10 w-10 items-center justify-center rounded-full text-[#1c1a1f]/70 transition-colors duration-150 hover:bg-[#faf9f7] disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b]";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex items-center justify-center gap-1.5"
    >
      <button
        aria-label="صفحه قبل"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={arrow}
      >
        <ChevronRight size={16} />
      </button>

      {getPageItems(page, totalPages).map((item) =>
        typeof item === "string" ? (
          <span
            key={item}
            className="flex h-10 w-6 items-center justify-center text-[#1c1a1f]/40"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            aria-label={`صفحه ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] ${
              item === page
                ? "bg-[#68578b] text-white shadow-sm"
                : "text-[#1c1a1f]/70 hover:bg-[#faf9f7]"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        aria-label="صفحه بعد"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className={arrow}
      >
        <ChevronLeft size={16} />
      </button>
    </nav>
  );
}
