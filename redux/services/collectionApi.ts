import {
  AdminCollectionDto,
  CollectionDto,
  CollectionProductDto,
  StoreCollectionDto,
} from "@/services/collection/collection.service";
import { baseApi } from "../baseApi";

// What the form sends (dates travel as ISO strings)
export type CollectionInput = {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

// Collections change what the storefront product lists contain
const storefrontTag = { type: "Product" as const, id: "LIST" };

export const collectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Storefront: live collections only
    getCollections: builder.query<StoreCollectionDto[], void>({
      query: () => "/collections",
      providesTags: [{ type: "COLLECTION", id: "LIST" }],
    }),

    // Admin table: everything, with product counts
    getAdminCollections: builder.query<AdminCollectionDto[], void>({
      query: () => "/admin/collections",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "COLLECTION" as const, id })),
              { type: "COLLECTION" as const, id: "LIST" },
            ]
          : [{ type: "COLLECTION" as const, id: "LIST" }],
    }),

    getCollectionBySlug: builder.query<CollectionDto, string>({
      query: (slug) => `/collections/slug/${encodeURIComponent(slug)}`,
      providesTags: (result) =>
        result ? [{ type: "COLLECTION" as const, id: result.id }] : [],
    }),

    getCollectionProducts: builder.query<CollectionProductDto[], string>({
      query: (id) => `/admin/collections/${id}/products`,
      providesTags: (_r, _e, id) => [
        { type: "COLLECTION", id: `PRODUCTS-${id}` },
      ],
    }),

    createCollection: builder.mutation<CollectionDto, CollectionInput>({
      query: (body) => ({ url: "/collections", method: "POST", body }),
      invalidatesTags: [{ type: "COLLECTION", id: "LIST" }],
    }),

    updateCollection: builder.mutation<
      CollectionDto,
      { id: string; body: Partial<CollectionInput> }
    >({
      query: ({ id, body }) => ({
        url: `/collections/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "COLLECTION", id },
        { type: "COLLECTION", id: "LIST" },
        storefrontTag,
      ],
    }),

    setCollectionProducts: builder.mutation<
      { productCount: number },
      { id: string; productIds: string[] }
    >({
      query: ({ id, productIds }) => ({
        url: `/admin/collections/${id}/products`,
        method: "PUT",
        body: { productIds },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "COLLECTION", id },
        { type: "COLLECTION", id: `PRODUCTS-${id}` },
        { type: "COLLECTION", id: "LIST" },
        storefrontTag,
      ],
    }),

    deleteCollection: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/collections/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "COLLECTION", id },
        { type: "COLLECTION", id: "LIST" },
        storefrontTag,
      ],
    }),
  }),
});

export const {
  useGetCollectionsQuery,
  useGetAdminCollectionsQuery,
  useGetCollectionBySlugQuery,
  useGetCollectionProductsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useSetCollectionProductsMutation,
  useDeleteCollectionMutation,
} = collectionApi;
