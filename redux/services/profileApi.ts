import { baseApi } from "../baseApi";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (id) => `/profile/${id}`,
      providesTags: ["USER"],
    }),
    updateProfile: builder.mutation({
      query: ({ body, id }) => ({
        url: `/profile/${id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
