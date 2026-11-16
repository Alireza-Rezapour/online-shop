import { baseApi } from "@/redux/baseApi";
import {
  DashboardRange,
  DashboardStats,
} from "@/services/dashboard/dashboard.types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, DashboardRange>({
      query: (range) => `/admin/dashboard?range=${range}`,
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
