import { baseApi } from "@/redux/baseApi";
import type { ColorDto } from "@/services/color/color.service";
import type {
  CreateColorInput,
  UpdateColorInput,
} from "@/services/color/color.schema";

export const colorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getColors: build.query<ColorDto[], void>({
      query: () => "/colors",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Color" as const, id })),
              { type: "Color" as const, id: "LIST" },
            ]
          : [{ type: "Color" as const, id: "LIST" }],
    }),

    getColor: build.query<ColorDto, string>({
      query: (id) => `/colors/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Color", id }],
    }),

    createColor: build.mutation<ColorDto, CreateColorInput>({
      query: (body) => ({ url: "/colors", method: "POST", body }),
      invalidatesTags: [{ type: "Color", id: "LIST" }],
    }),

    updateColor: build.mutation<
      ColorDto,
      { id: string; data: UpdateColorInput }
    >({
      query: ({ id, data }) => ({
        url: `/colors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Color", id },
        { type: "Color", id: "LIST" },
      ],
    }),

    deleteColor: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/colors/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Color", id },
        { type: "Color", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetColorsQuery,
  useGetColorQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} = colorApi;
