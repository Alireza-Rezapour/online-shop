import { StoreProductCardDto } from "@/services/product/store-product.service";

// What every list needs from a product: the storefront card shape
export type ListProduct = StoreProductCardDto;

export type ProductFiltersState = {
  priceRange?: [number, number];
  colorIds?: string[];
  sizeNames?: string[];
  discountOnly?: boolean;
  inStockOnly?: boolean;
};

export type ProductSortOption = "newest" | "cheapest" | "expensive";

export const DEFAULT_SORT: ProductSortOption = "newest";
