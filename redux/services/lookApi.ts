import { baseApi } from "../baseApi";
import type {
  CreateLookBody,
  UpdateLookBody,
} from "@/services/look/look.schema";
import type {
  AdminLookDto,
  AdminLookItemDto,
} from "@/services/look/look.types";

export type AdminLook = AdminLookDto;
export type LookPickerProduct = AdminLookItemDto;

// Remember to add "LOOK" to tagTypes in baseApi:
//   tagTypes: ["LOOK", ...]
// The storefront reads looks on the server, so it has no endpoint here.

export const lookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminLooks: builder.query<AdminLook[], void>({
      query: () => "/admin/looks",
      providesTags: [{ type: "LOOK", id: "ADMIN_LIST" }],
    }),

    getLook: builder.query<AdminLook, string>({
      query: (id) => `/admin/looks/${id}`,
      providesTags: (_r, _e, id) => [{ type: "LOOK", id }],
    }),

    searchLookProducts: builder.query<LookPickerProduct[], { search?: string }>({
      query: ({ search }) => ({
        url: "/admin/looks/product-options",
        params: { search },
      }),
    }),

    createLook: builder.mutation<AdminLook, CreateLookBody>({
      query: (body) => ({ url: "/admin/looks", method: "POST", body }),
      invalidatesTags: [{ type: "LOOK", id: "ADMIN_LIST" }],
    }),

    updateLook: builder.mutation<AdminLook, { id: string; body: UpdateLookBody }>({
      query: ({ id, body }) => ({
        url: `/admin/looks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "LOOK", id },
        { type: "LOOK", id: "ADMIN_LIST" },
      ],
    }),

    reorderLooks: builder.mutation<
      { success: true },
      { items: { id: string; sortOrder: number }[] }
    >({
      query: (body) => ({ url: "/admin/looks/reorder", method: "PATCH", body }),
      invalidatesTags: [{ type: "LOOK", id: "ADMIN_LIST" }],
    }),

    deleteLook: builder.mutation<{ success: true }, string>({
      query: (id) => ({ url: `/admin/looks/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "LOOK", id },
        { type: "LOOK", id: "ADMIN_LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminLooksQuery,
  useGetLookQuery,
  useSearchLookProductsQuery,
  useCreateLookMutation,
  useUpdateLookMutation,
  useReorderLooksMutation,
  useDeleteLookMutation,
} = lookApi;
