import { baseApi } from "../baseApi";
import type {
  CreatePaymentResult,
  GetPaymentsParams,
  PaymentDto,
  PaymentWithOrderDto,
  UpdatePaymentStatusRequest,
  VerifyPaymentResult,
} from "@/services/payment/payment.dto";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentWithOrderDto[], GetPaymentsParams | void>(
      {
        query: (params) => ({ url: "/payments", params: params ?? undefined }),
        providesTags: (result) =>
          result
            ? [
                ...result.map(({ id }) => ({ type: "PAYMENT" as const, id })),
                { type: "PAYMENT" as const, id: "LIST" },
              ]
            : [{ type: "PAYMENT" as const, id: "LIST" }],
      },
    ),

    getPayment: builder.query<PaymentWithOrderDto, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PAYMENT", id }],
    }),

    getPaymentByOrder: builder.query<PaymentDto, string>({
      query: (orderId) => `/orders/${orderId}/payment`,
      providesTags: (_result, _error, orderId) => [
        { type: "PAYMENT", id: `ORDER-${orderId}` },
      ],
    }),

    // Starts (or restarts) the payment of an order and reserves its stock
    createPayment: builder.mutation<CreatePaymentResult, { orderId: string }>({
      query: ({ orderId }) => ({
        url: `/orders/${orderId}/payment`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "PAYMENT", id: "LIST" },
        { type: "PAYMENT", id: `ORDER-${orderId}` },
        { type: "ORDER", id: orderId },
        { type: "ORDER", id: "LIST" },
        { type: "Product", id: "LIST" }, // stock is reserved
      ],
    }),

    // The gateway result: SUCCESS marks the order paid and moves the stock
    updatePaymentStatus: builder.mutation<
      VerifyPaymentResult,
      UpdatePaymentStatusRequest
    >({
      query: ({ id, status }) => ({
        url: `/payments/${id}/status`,
        body: { status },
        method: "PATCH",
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: "PAYMENT", id },
        { type: "PAYMENT", id: "LIST" },
        ...(result
          ? [
              { type: "PAYMENT" as const, id: `ORDER-${result.orderId}` },
              { type: "ORDER" as const, id: result.orderId },
              { type: "ORDER" as const, id: "LIST" },
              { type: "Product" as const, id: "LIST" },
            ]
          : []),
      ],
    }),

    // Failed payments only
    deletePayment: builder.mutation<{ id: string; orderId: string }, string>({
      query: (id) => ({ url: `/payments/${id}`, method: "DELETE" }),
      invalidatesTags: (result, _error, id) => [
        { type: "PAYMENT", id },
        { type: "PAYMENT", id: "LIST" },
        ...(result
          ? [
              { type: "PAYMENT" as const, id: `ORDER-${result.orderId}` },
              { type: "ORDER" as const, id: result.orderId },
              { type: "ORDER" as const, id: "LIST" },
            ]
          : []),
      ],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useGetPaymentByOrderQuery,
  useCreatePaymentMutation,
  useUpdatePaymentStatusMutation,
  useDeletePaymentMutation,
} = paymentApi;
