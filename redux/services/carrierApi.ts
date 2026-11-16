import { baseApi } from "../baseApi";

export type Carrier = {
  id: string;
  name: string;
  cost: number;
};

export type CreateCarrierInput = {
  name: string;
  cost: number;
};

export type UpdateCarrierInput = CreateCarrierInput & {
  id: string;
};

export type DeleteCarrierResult = {
  id: string;
};

export const carrierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCarriers: builder.query<Carrier[], void>({
      query: () => "/carriers",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Carrier" as const, id })),
              { type: "Carrier" as const, id: "LIST" },
            ]
          : [{ type: "Carrier" as const, id: "LIST" }],
    }),

    createCarrier: builder.mutation<Carrier, CreateCarrierInput>({
      query: (body) => ({
        url: "/carriers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Carrier", id: "LIST" }],
    }),

    updateCarrier: builder.mutation<Carrier, UpdateCarrierInput>({
      query: ({ id, ...body }) => ({
        url: `/carriers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Carrier", id },
        { type: "Carrier", id: "LIST" },
      ],
    }),

    deleteCarrier: builder.mutation<DeleteCarrierResult, string>({
      query: (id) => ({ url: `/carriers/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Carrier", id },
        { type: "Carrier", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCarriersQuery,
  useCreateCarrierMutation,
  useUpdateCarrierMutation,
  useDeleteCarrierMutation,
} = carrierApi;
