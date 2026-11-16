import { baseApi } from "../baseApi";
import type { ShipmentStatus } from "@/lib/generated/prisma/enums";
import type {
  CreateShipmentRequest,
  GetShipmentsParams,
  ShipmentDto,
  ShipmentWithCarrierDto,
  ShipmentWithOrderDto,
  UpdateShipmentRequest,
} from "@/services/shipment/shipment.dto";

export const shipmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShipments: builder.query<
      ShipmentWithOrderDto[],
      GetShipmentsParams | void
    >({
      query: (params) => ({ url: "/shipments", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "SHIPMENT" as const, id })),
              { type: "SHIPMENT" as const, id: "LIST" },
            ]
          : [{ type: "SHIPMENT" as const, id: "LIST" }],
    }),

    getShipment: builder.query<ShipmentWithOrderDto, string>({
      query: (id) => `/shipments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "SHIPMENT", id }],
    }),

    getShipmentByOrder: builder.query<ShipmentWithCarrierDto, string>({
      query: (orderId) => `/orders/${orderId}/shipment`,
      providesTags: (_result, _error, orderId) => [
        { type: "SHIPMENT", id: `ORDER-${orderId}` },
      ],
    }),

    createShipment: builder.mutation<
      ShipmentDto,
      { orderId: string; body: CreateShipmentRequest }
    >({
      query: ({ orderId, body }) => ({
        url: `/orders/${orderId}/shipment`,
        body,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "SHIPMENT", id: "LIST" },
        { type: "SHIPMENT", id: `ORDER-${orderId}` },
        { type: "ORDER", id: orderId },
        { type: "ORDER", id: "LIST" },
      ],
    }),

    // Carrier and tracking code only: status has its own endpoint
    updateShipment: builder.mutation<
      ShipmentDto,
      { id: string; body: UpdateShipmentRequest }
    >({
      query: ({ id, body }) => ({
        url: `/shipments/${id}`,
        body,
        method: "PUT",
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: "SHIPMENT", id },
        { type: "SHIPMENT", id: "LIST" },
        ...(result
          ? [
              { type: "ORDER" as const, id: result.orderId },
              { type: "SHIPMENT" as const, id: `ORDER-${result.orderId}` },
            ]
          : []),
      ],
    }),

    // Also moves the order (packing, shipped, delivered, returned)
    updateShipmentStatus: builder.mutation<
      ShipmentDto,
      { id: string; status: ShipmentStatus }
    >({
      query: ({ id, status }) => ({
        url: `/shipments/${id}/status`,
        body: { status },
        method: "PATCH",
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: "SHIPMENT", id },
        { type: "SHIPMENT", id: "LIST" },
        { type: "ORDER", id: "LIST" },
        ...(result
          ? [
              { type: "ORDER" as const, id: result.orderId },
              { type: "SHIPMENT" as const, id: `ORDER-${result.orderId}` },
            ]
          : []),
      ],
    }),

    // Shipments that have not left the warehouse only
    deleteShipment: builder.mutation<{ id: string; orderId: string }, string>({
      query: (id) => ({ url: `/shipments/${id}`, method: "DELETE" }),
      invalidatesTags: (result, _error, id) => [
        { type: "SHIPMENT", id },
        { type: "SHIPMENT", id: "LIST" },
        { type: "ORDER", id: "LIST" },
        ...(result
          ? [
              { type: "ORDER" as const, id: result.orderId },
              { type: "SHIPMENT" as const, id: `ORDER-${result.orderId}` },
            ]
          : []),
      ],
    }),
  }),
});

export const {
  useGetShipmentsQuery,
  useGetShipmentQuery,
  useGetShipmentByOrderQuery,
  useCreateShipmentMutation,
  useUpdateShipmentMutation,
  useUpdateShipmentStatusMutation,
  useDeleteShipmentMutation,
} = shipmentApi;
