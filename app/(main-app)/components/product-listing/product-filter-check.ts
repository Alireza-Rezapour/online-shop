import type { ListProduct, ProductFiltersState } from "./types";

export type FilterOptions = {
  colors: { id: string; name: string; hex: string }[];
  sizes: string[];
  priceBounds: [number, number];
};

export function getEffectivePrice(product: ListProduct): number {
  return product.salePrice ?? product.basePrice;
}

export function hasDiscount(product: ListProduct): boolean {
  return product.salePrice != null && product.salePrice < product.basePrice;
}

/** The options a list offers are whatever exists in the products it was given. */
export function getFilterOptions(products: ListProduct[]): FilterOptions {
  const colors = new Map<string, { id: string; name: string; hex: string }>();
  const sizes: string[] = [];
  let min = Infinity;
  let max = 0;

  for (const product of products) {
    for (const color of product.colors) {
      if (!colors.has(color.id)) {
        colors.set(color.id, {
          id: color.id,
          name: color.name,
          hex: color.hex,
        });
      }
    }
    for (const variant of product.variants) {
      if (!sizes.includes(variant.sizeName)) sizes.push(variant.sizeName);
    }
    const price = getEffectivePrice(product);
    min = Math.min(min, price);
    max = Math.max(max, price);
  }

  return {
    colors: [...colors.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "fa"),
    ),
    sizes,
    priceBounds: products.length > 0 ? [min, max] : [0, 0],
  };
}

export function countActiveFilters(
  filters: ProductFiltersState,
  priceBounds: [number, number],
): number {
  let count = 0;
  const { priceRange } = filters;

  if (
    priceRange &&
    (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1])
  )
    count++;
  count += filters.colorIds?.length ?? 0;
  count += filters.sizeNames?.length ?? 0;
  if (filters.discountOnly) count++;
  if (filters.inStockOnly) count++;

  return count;
}

/**
 * Filters a product array. Pure: never mutates the input. Works on whatever
 * list is passed in (category, search, favorites...).
 */
export function filterProducts(
  products: ListProduct[],
  filters: ProductFiltersState,
): ListProduct[] {
  const { priceRange, colorIds, sizeNames, discountOnly, inStockOnly } =
    filters;

  return products.filter((product) => {
    if (priceRange) {
      const price = getEffectivePrice(product);
      if (price < priceRange[0] || price > priceRange[1]) return false;
    }

    if (discountOnly && !hasDiscount(product)) return false;

    // Color, size and stock must all be true on the SAME variant
    // ("black + M" means a black M exists, not just a black one and an M)
    if (colorIds?.length || sizeNames?.length || inStockOnly) {
      const match = product.variants.some(
        (variant) =>
          (!colorIds?.length || colorIds.includes(variant.colorId)) &&
          (!sizeNames?.length || sizeNames.includes(variant.sizeName)) &&
          (!inStockOnly || variant.availableStock > 0),
      );
      if (!match) return false;
    }

    return true;
  });
}
