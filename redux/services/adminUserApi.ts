// redux/services/admin/adminUserApi.ts  (adjust the baseApi import to your folder layout)
import { baseApi } from "../baseApi";

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  _count: { orders: number };
}

export interface AdminUserDetail extends AdminUserListItem {
  emailVerified: boolean;
  updatedAt: string;
}

export interface AdminUserOrder {
  id: string;
  status: string;
  totalPrice: string | number; // Prisma Decimal arrives as a string
  couponCode: string | null;
  discountAmount: string | number | null;
  createdAt: string;
  _count: { items: number };
}

export interface AdminUserCoupon {
  userId: string;
  couponId: string;
  coupon: {
    id: string;
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | string; // match your CouponType enum
    value: string | number;
    isActive: boolean;
    expiresAt: string | null;
  };
}

export interface AdminUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: "admin" | "user";
  banned?: "true" | "false";
}

export const adminUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<
      Paginated<AdminUserListItem>,
      AdminUsersParams
    >({
      query: (params) => ({ url: "/admin/users", params }),
      providesTags: ["USER"],
    }),

    getAdminUser: builder.query<AdminUserDetail, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "USER", id }],
    }),

    getAdminUserOrders: builder.query<
      Paginated<AdminUserOrder>,
      { id: string; page: number; pageSize: number }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/users/${id}/orders`,
        params,
      }),
      providesTags: ["ORDER"],
    }),

    getAdminUserCoupons: builder.query<
      Paginated<AdminUserCoupon>,
      { id: string; page: number; pageSize: number }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/users/${id}/coupons`,
        params,
      }),
      providesTags: ["Coupon"],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useGetAdminUserOrdersQuery,
  useGetAdminUserCouponsQuery,
} = adminUserApi;
