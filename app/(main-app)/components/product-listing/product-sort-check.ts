import { getEffectivePrice } from "./product-filter-check";
import type { ListProduct, ProductSortOption } from "./types";

export const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
];

/** Never mutates the input: always returns a new array. */
export function sortProducts(
  products: ListProduct[],
  sort: ProductSortOption,
): ListProduct[] {
  const sorted = [...products];

  switch (sort) {
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "cheapest":
      sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
      break;
    case "expensive":
      sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
      break;
  }

  return sorted;
}
