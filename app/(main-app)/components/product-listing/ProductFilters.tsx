"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "./ui";
import { countActiveFilters, type FilterOptions } from "./product-filter-check";
import type { ProductFiltersState } from "./types";

interface ProductFiltersProps {
  filters: ProductFiltersState;
  options: FilterOptions;
  onChange: (filters: ProductFiltersState) => void;
  onClear: () => void;
}

const formatPrice = (value: number) => `${value.toLocaleString("fa-IR")} تومان`;

function toggle(
  list: string[] | undefined,
  value: string,
): string[] | undefined {
  const current = list ?? [];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return next.length > 0 ? next : undefined;
}

function Separator() {
  return <div className="h-px w-full bg-[#e8e5e1]" />;
}

export default function ProductFilters({
  filters,
  options,
  onChange,
  onClear,
}: ProductFiltersProps) {
  const [minPrice, maxPrice] = options.priceBounds;
  const priceValue = filters.priceRange ?? options.priceBounds;
  const activeCount = countActiveFilters(filters, options.priceBounds);

  return (
    <div className="flex flex-col gap-8">
      {maxPrice > minPrice && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-[#1c1a1f]">
            محدوده قیمت
          </span>
          <Slider
            dir="ltr"
            min={minPrice}
            max={maxPrice}
            step={10000}
            value={priceValue}
            onValueChange={(v) =>
              onChange({
                ...filters,
                // back at the full range means "no price filter"
                priceRange:
                  v[0] === minPrice && v[1] === maxPrice
                    ? undefined
                    : [v[0], v[1]],
              })
            }
          />
          <div className="flex items-center justify-between text-xs text-[#1c1a1f]/60">
            <span>{formatPrice(priceValue[1])}</span>
            <span>{formatPrice(priceValue[0])}</span>
          </div>
        </div>
      )}

      {options.colors.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[#1c1a1f]">رنگ</h3>
            <div
              className="flex flex-wrap gap-3"
              role="group"
              aria-label="فیلتر رنگ"
            >
              {options.colors.map((color) => {
                const selected = filters.colorIds?.includes(color.id) ?? false;
                return (
                  <button
                    key={color.id}
                    type="button"
                    aria-pressed={selected}
                    aria-label={color.name}
                    title={color.name}
                    onClick={() =>
                      onChange({
                        ...filters,
                        colorIds: toggle(filters.colorIds, color.id),
                      })
                    }
                    className="h-8 w-8 rounded-full p-0.75 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2"
                    style={{
                      border: selected
                        ? "2px solid #68578b"
                        : "2px solid transparent",
                    }}
                  >
                    <span
                      className="block h-full w-full rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {options.sizes.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[#1c1a1f]">سایز</h3>
            <div
              dir="ltr"
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="فیلتر سایز"
            >
              {options.sizes.map((size) => {
                const selected = filters.sizeNames?.includes(size) ?? false;
                return (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({
                        ...filters,
                        sizeNames: toggle(filters.sizeNames, size),
                      })
                    }
                    className={`h-10 min-w-12 rounded-full border px-3 text-sm font-medium transition-all duration-200 ${
                      selected
                        ? "border-[#68578b] bg-[#68578b] text-white"
                        : "border-[#1c1a1f]/15 text-[#1c1a1f] hover:border-[#68578b]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm text-[#1c1a1f]">
          <Checkbox
            checked={filters.inStockOnly ?? false}
            onCheckedChange={(checked) =>
              onChange({
                ...filters,
                inStockOnly: checked === true || undefined,
              })
            }
          />
          فقط کالاهای موجود
        </label>
        <label className="flex items-center gap-2 text-sm text-[#1c1a1f]">
          <Checkbox
            checked={filters.discountOnly ?? false}
            onCheckedChange={(checked) =>
              onChange({
                ...filters,
                discountOnly: checked === true || undefined,
              })
            }
          />
          فقط محصولات دارای تخفیف
        </label>
      </div>

      <Button
        variant="outline"
        onClick={onClear}
        disabled={activeCount === 0}
        className="w-full py-2"
      >
        پاک کردن فیلتر ها
      </Button>
    </div>
  );
}
