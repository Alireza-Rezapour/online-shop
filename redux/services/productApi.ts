import { baseApi } from "@/redux/baseApi";
import type { ProductAdminDto } from "@/services/product/product.service";
import type {
  ProductAttributesInput,
  ProductBasicInput,
  ProductImagesInput,
  ProductListParams,
  ProductVariantsInput,
} from "@/services/product/product.schema";
import { ProductListDto } from "@/services/product/product-list.service";

const listTag = [{ type: "Product" as const, id: "LIST" }];

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductAdmin: build.query<ProductAdminDto, string>({
      query: (id) => `/admin/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    createProductDraft: build.mutation<ProductAdminDto, ProductBasicInput>({
      query: (body) => ({ url: "/admin/products", method: "POST", body }),
      invalidatesTags: listTag,
    }),

    updateProductBasic: build.mutation<
      ProductAdminDto,
      { id: string; data: ProductBasicInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: listTag,
    }),

    saveProductAttributes: build.mutation<
      ProductAdminDto,
      { id: string; data: ProductAttributesInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}/attributes`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: listTag,
    }),

    saveProductVariants: build.mutation<
      ProductAdminDto,
      { id: string; data: ProductVariantsInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}/variants`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: listTag,
    }),

    saveProductImages: build.mutation<
      ProductAdminDto,
      { id: string; data: ProductImagesInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}/images`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: listTag,
    }),

    setProductPublished: build.mutation<
      ProductAdminDto,
      { id: string; isPublished: boolean }
    >({
      query: ({ id, isPublished }) => ({
        url: `/admin/products/${id}/publish`,
        method: "POST",
        body: { isPublished },
      }),
      invalidatesTags: listTag,
    }),
    getProducts: build.query<ProductListDto, ProductListParams | void>({
      query: (params) => ({
        url: "/admin/products",
        params: params ?? undefined,
      }),
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

    deleteProduct: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Product", id }, ...listTag],
    }),
  }),
});

export const {
  useGetProductAdminQuery,
  useCreateProductDraftMutation,
  useUpdateProductBasicMutation,
  useSaveProductAttributesMutation,
  useSaveProductVariantsMutation,
  useSaveProductImagesMutation,
  useSetProductPublishedMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
} = productApi;
