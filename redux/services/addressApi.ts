import { baseApi } from "../baseApi";

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query({
      query: () => "/addresses",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({
                type: "ADDRESS" as const,
                id,
              })),
              { type: "ADDRESS", id: "LIST" },
            ]
          : [{ type: "ADDRESS", id: "LIST" }],
    }),
    createAddress: builder.mutation({
      query: (body) => ({ url: "/addresses", method: "POST", body }),
      invalidatesTags: [{ type: "ADDRESS", id: "LIST" }],
    }),
    updateAddress: builder.mutation({
      query: ({ id, body }: { id: string; body: unknown }) => ({
        url: `/addresses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ADDRESS", id },
        { type: "ADDRESS", id: "LIST" },
      ],
    }),
    deleteAddress: builder.mutation({
      query: (id: string) => ({ url: `/addresses/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "ADDRESS", id },
        { type: "ADDRESS", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
