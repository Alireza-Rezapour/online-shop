import { baseApi } from "@/redux/baseApi";
import type { SizeChartDto } from "@/services/size-chart/size-chart.service";
import type {
  CreateSizeChartInput,
  UpdateSizeChartInput,
} from "@/services/size-chart/size-chart.schema";

// Category responses embed the size chart, so they go stale when a chart changes
const categoryTags = [
  { type: "Category" as const, id: "LIST" },
  { type: "Category" as const, id: "TREE" },
];

export const sizeChartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSizeCharts: build.query<SizeChartDto[], void>({
      query: () => "/size-charts",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "SizeChart" as const, id })),
              { type: "SizeChart" as const, id: "LIST" },
            ]
          : [{ type: "SizeChart" as const, id: "LIST" }],
    }),

    getSizeChart: build.query<SizeChartDto, string>({
      query: (id) => `/size-charts/${id}`,
      providesTags: (_r, _e, id) => [{ type: "SizeChart", id }],
    }),

    createSizeChart: build.mutation<SizeChartDto, CreateSizeChartInput>({
      query: (body) => ({ url: "/size-charts", method: "POST", body }),
      invalidatesTags: [{ type: "SizeChart", id: "LIST" }],
    }),

    updateSizeChart: build.mutation<
      SizeChartDto,
      { id: string; data: UpdateSizeChartInput }
    >({
      query: ({ id, data }) => ({
        url: `/size-charts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "SizeChart", id },
        { type: "SizeChart", id: "LIST" },
        ...categoryTags,
      ],
    }),

    deleteSizeChart: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/size-charts/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "SizeChart", id },
        { type: "SizeChart", id: "LIST" },
        ...categoryTags,
      ],
    }),
  }),
});

export const {
  useGetSizeChartsQuery,
  useGetSizeChartQuery,
  useCreateSizeChartMutation,
  useUpdateSizeChartMutation,
  useDeleteSizeChartMutation,
} = sizeChartApi;
