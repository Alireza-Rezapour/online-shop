import { baseApi } from "@/redux/baseApi";
import type {
  CouponDto,
  CouponListResult,
  CouponBody,
  ListCouponsParams,
  UpdateCouponBody,
  ValidateCouponInput,
  ValidateCouponResult,
} from "@/services/coupon/coupon.schema";

export const couponApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ---- admin ----
    getCoupons: build.query<CouponListResult, ListCouponsParams | void>({
      query: (params) => ({
        url: "/admin/coupons",
        params: params ?? undefined,
      }),
      providesTags: (result) => [
        ...(result?.items ?? []).map(({ id }) => ({
          type: "Coupon" as const,
          id,
        })),
        { type: "Coupon" as const, id: "LIST" },
      ],
    }),

    getCoupon: build.query<CouponDto, string>({
      query: (id) => `/admin/coupons/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Coupon", id }],
    }),

    createCoupon: build.mutation<CouponDto, CouponBody>({
      query: (body) => ({ url: "/admin/coupons", method: "POST", body }),
      invalidatesTags: [{ type: "Coupon", id: "LIST" }],
    }),

    updateCoupon: build.mutation<
      CouponDto,
      { id: string; data: UpdateCouponBody }
    >({
      query: ({ id, data }) => ({
        url: `/admin/coupons/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Coupon", id },
        { type: "Coupon", id: "LIST" },
      ],
    }),

    deleteCoupon: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/admin/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Coupon", id },
        { type: "Coupon", id: "LIST" },
      ],
    }),

    // ---- storefront (checkout "apply coupon") ----
    validateCoupon: build.mutation<ValidateCouponResult, ValidateCouponInput>({
      query: (body) => ({ url: "/coupons/validate", method: "POST", body }),
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
} = couponApi;
