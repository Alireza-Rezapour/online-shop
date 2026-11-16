"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import EmptyState from "./EmptyState";
import { MobileDrawer } from "./MobileDrawer";
import Pagination from "./Pagination";
import { ProductCard } from "./ProductCard";
import ProductFilters from "./ProductFilters";
import Select from "./SelectSort";
import { Button } from "./ui";
import {
  countActiveFilters,
  filterProducts,
  getFilterOptions,
} from "./product-filter-check";
import { SORT_OPTIONS, sortProducts } from "./product-sort-check";
import {
  DEFAULT_SORT,
  type ListProduct,
  type ProductFiltersState,
  type ProductSortOption,
} from "./types";

const PAGE_SIZE = 12;

interface ProductListViewProps {
  products: ListProduct[];
  title?: string;
  // Shown when the list itself is empty, e.g. "no favorites yet"
  emptyMessage?: string;
}

export function ProductListView({
  products,
  title,
  emptyMessage,
}: ProductListViewProps) {
  const [filters, setFilters] = useState<ProductFiltersState>({});
  const [sort, setSort] = useState<ProductSortOption>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const options = useMemo(() => getFilterOptions(products), [products]);

  const visible = useMemo(
    () => sortProducts(filterProducts(products, filters), sort),
    [products, filters, sort],
  );

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const activeCount = countActiveFilters(filters, options.priceBounds);

  const changeFilters = (next: ProductFiltersState) => {
    setFilters(next);
    setPage(1);
  };
  const changeSort = (next: ProductSortOption) => {
    setSort(next);
    setPage(1);
  };
  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtersPanel = (
    <ProductFilters
      filters={filters}
      options={options}
      onChange={changeFilters}
      onClear={() => changeFilters({})}
    />
  );

  return (
    <div className="bg-white text-[#1c1a1f]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex gap-12">
          {/* Sidebar (desktop) */}
          {products.length > 0 && (
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-10">
                <h2 className="mb-6 text-xl">فیلتر</h2>
                {filtersPanel}
              </div>
            </aside>
          )}

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                {title && <h1 className="text-3xl sm:text-4xl">{title}</h1>}
                <p className="mt-1 text-sm text-[#1c1a1f]/55">
                  {visible.length.toLocaleString("fa-IR")} محصول
                </p>
              </div>

              {products.length > 0 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="p-2 lg:hidden"
                    onClick={() => setSheetOpen(true)}
                    aria-label="باز کردن فیلتر ها"
                  >
                    <SlidersHorizontal size={15} />
                    فیلتر ها
                    {activeCount > 0 && (
                      <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#68578b] text-[10px] text-white">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                  <Select
                    value={sort}
                    options={SORT_OPTIONS}
                    onChange={(value) => changeSort(value as ProductSortOption)}
                    label="مرتب‌سازی محصولات"
                  />
                </div>
              )}
            </div>

            {products.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : visible.length === 0 ? (
              <EmptyState onClear={() => changeFilters({})} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
                  {paged.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="mt-14">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={changePage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileDrawer open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {filtersPanel}
      </MobileDrawer>
    </div>
  );
}
