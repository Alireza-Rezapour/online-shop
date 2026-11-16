import { baseApi } from "../baseApi";
import type { OrderItemDto } from "@/services/order/order.dto";

export const orderItemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderItems: builder.query<OrderItemDto[], string>({
      query: (orderId) => `/orders/${orderId}/items`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ORDER_ITEM" as const, id })),
              { type: "ORDER_ITEM" as const, id: "LIST" },
            ]
          : [{ type: "ORDER_ITEM" as const, id: "LIST" }],
    }),

    getOrderItem: builder.query<OrderItemDto, { orderId: string; id: string }>({
      query: ({ orderId, id }) => `/orders/${orderId}/items/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: "ORDER_ITEM", id }],
    }),
  }),
});

export const { useGetOrderItemsQuery, useGetOrderItemQuery } = orderItemApi;
