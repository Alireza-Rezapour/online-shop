import { baseApi } from "../baseApi";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import type {
  CreateOrderRequest,
  CreateOrderResult,
  GetOrdersParams,
  OrderDto,
  OrderRowDto,
  PaginatedOrdersDto,
  UpdateOrderShippingRequest,
} from "@/services/order/order.dto";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrderDto[], GetOrdersParams | void>({
      query: (params) => ({ url: "/orders", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ORDER" as const, id })),
              { type: "ORDER" as const, id: "LIST" },
            ]
          : [{ type: "ORDER" as const, id: "LIST" }],
    }),
    getOrdersPage: builder.query<PaginatedOrdersDto, GetOrdersParams>({
      query: (params) => ({ url: "/orders", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "ORDER" as const, id })),
              { type: "ORDER" as const, id: "LIST" },
            ]
          : [{ type: "ORDER" as const, id: "LIST" }],
    }),
    getOrder: builder.query<OrderDto, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ORDER", id }],
    }),

    createOrder: builder.mutation<CreateOrderResult, CreateOrderRequest>({
      query: (body) => ({ url: "/orders", body, method: "POST" }),
      invalidatesTags: [{ type: "ORDER", id: "LIST" }],
    }),

    // Admin: fix the delivery details only
    updateOrder: builder.mutation<
      OrderRowDto,
      { id: string; body: UpdateOrderShippingRequest }
    >({
      query: ({ id, body }) => ({ url: `/orders/${id}`, body, method: "PUT" }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ORDER", id },
        { type: "ORDER", id: "LIST" },
      ],
    }),

    // A status change (above all a cancel) also moves payment, shipment and stock
    updateOrderStatus: builder.mutation<
      OrderRowDto,
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        body: { status },
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ORDER", id },
        { type: "ORDER", id: "LIST" },
        { type: "PAYMENT", id: "LIST" },
        { type: "PAYMENT", id: `ORDER-${id}` },
        { type: "SHIPMENT", id: "LIST" },
        { type: "SHIPMENT", id: `ORDER-${id}` },
        { type: "Product", id: "LIST" },
      ],
    }),

    // Cancelled orders only: its payment and shipment go with it
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({ url: `/orders/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ORDER", id },
        { type: "ORDER", id: "LIST" },
        { type: "PAYMENT", id: "LIST" },
        { type: "SHIPMENT", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrdersPageQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = orderApi;
