"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function getPageItems(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("ellipsis-start");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);
  return items;
}

export function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  itemLabel,
  disabled,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  itemLabel: string;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const fa = (n: number) => n.toLocaleString("fa-IR");

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        نمایش {itemLabel} {fa(from)} تا {fa(to)} از {fa(total)}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* RTL: "previous" sits on the right, so it gets the right-pointing chevron */}
          <Button
            variant="outline"
            size="icon"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="صفحه قبلی"
          >
            <ChevronRight className="size-4" />
          </Button>

          {getPageItems(page, totalPages).map((item) =>
            typeof item === "string" ? (
              <span key={item} className="px-2 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? "default" : "outline"}
                size="icon"
                disabled={disabled}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
              >
                {fa(item)}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="صفحه بعدی"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
