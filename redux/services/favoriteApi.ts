import { StoreProductCardDto } from "@/services/product/store-product.service";
import { baseApi } from "../baseApi";

export const favoriteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<StoreProductCardDto[], void>({
      query: () => "/favorites",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Favorite" as const, id })),
              { type: "Favorite" as const, id: "LIST" },
            ]
          : [{ type: "Favorite" as const, id: "LIST" }],
    }),

    toggleFavorite: builder.mutation<
      { favorited: boolean },
      { productId: string }
    >({
      query: (body) => ({ url: "/favorites/toggle", body, method: "POST" }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Favorite", id: "LIST" },
        { type: "Product", id: productId },
      ],
    }),
  }),
});

export const { useGetFavoritesQuery, useToggleFavoriteMutation } = favoriteApi;
