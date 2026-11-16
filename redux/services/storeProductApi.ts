import { baseApi } from "@/redux/baseApi";
import type {
  StoreProductCardDto,
  StoreProductDetailDto,
  StoreProductListDto,
} from "@/services/product/store-product.service";
import type { StoreProductListParams } from "@/services/product/product.schema";

// Shares the admin "LIST" tag, so a save in the admin refreshes any storefront cache
const listTag = [{ type: "Product" as const, id: "LIST" }];

export const storeProductApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStoreProducts: build.query<
      StoreProductListDto,
      StoreProductListParams | void
    >({
      query: (params) => {
        const { colors, sizes, inStock, favorites, ...rest } = params ?? {};
        return {
          url: "/products",
          params: {
            ...rest,
            ...(inStock ? { inStock: "true" } : {}),
            ...(favorites ? { favorites: "true" } : {}),
            ...(colors?.length ? { colors: colors.join(",") } : {}),
            ...(sizes?.length ? { sizes: sizes.join(",") } : {}),
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Product" as const,
                id,
              })),
              ...listTag,
            ]
          : listTag,
    }),

    // Home page: products ranked by units sold (paid orders only)
    getBestSellingProducts: build.query<
      StoreProductCardDto[],
      { limit?: number; days?: number } | void
    >({
      query: (params) => ({
        url: "/products/best-selling",
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Product" as const,
                id,
              })),
              ...listTag,
            ]
          : listTag,
    }),

    getStoreProductBySlug: build.query<StoreProductDetailDto, string>({
      query: (slug) => `/products/${encodeURIComponent(slug)}`,
      providesTags: (result) =>
        result
          ? [{ type: "Product" as const, id: result.id }, ...listTag]
          : listTag,
    }),
  }),
});

export const {
  useGetStoreProductsQuery,
  useGetBestSellingProductsQuery,
  useGetStoreProductBySlugQuery,
  useLazyGetStoreProductsQuery,
} = storeProductApi;
