import { baseApi } from "../baseApi";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";

export interface ReviewUser {
  id: string;
  name: string;
  /** public endpoints return image, admin endpoints return email */
  image?: string | null;
  email?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
  product?: { id: string; title: string; slug: string };
}

export interface ProductReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

export interface AdminReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewEligibility {
  hasPurchased: boolean;
  alreadyReviewed: boolean;
  canReview: boolean;
}

// Moderation changes what shoppers see, so the storefront cache of that product is refreshed too
const moderationTags = (
  result: { productId: string } | undefined,
  id: string,
) => [
  "AdminReview" as const,
  { type: "AdminReview" as const, id },
  ...(result ? [{ type: "Review" as const, id: result.productId }] : []),
];

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<
      ProductReviewsResponse,
      { productId: string; page?: number; limit?: number }
    >({
      query: ({ productId, page = 1, limit = 10 }) =>
        `/products/${productId}/reviews?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { productId }) => [
        { type: "Review", id: productId },
      ],
    }),

    getReviewEligibility: builder.query<
      ReviewEligibility,
      { productId: string }
    >({
      query: ({ productId }) => `/products/${productId}/reviews/eligibility`,
      providesTags: (_result, _error, { productId }) => [
        { type: "ReviewEligibility", id: productId },
      ],
    }),

    createReview: builder.mutation<
      Review,
      { productId: string; rating: number; title?: string; comment: string }
    >({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/reviews`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Review", id: productId },
        { type: "ReviewEligibility", id: productId },
        "AdminReview",
      ],
    }),

    getAdminReviews: builder.query<
      AdminReviewsResponse,
      {
        status?: ReviewStatus;
        productId?: string;
        userId?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.set("status", params.status);
        if (params.productId) searchParams.set("productId", params.productId);
        if (params.userId) searchParams.set("userId", params.userId);
        searchParams.set("page", String(params.page ?? 1));
        searchParams.set("limit", String(params.limit ?? 20));
        return `/admin/reviews?${searchParams.toString()}`;
      },
      providesTags: ["AdminReview"],
    }),

    getAdminReview: builder.query<Review, { id: string }>({
      query: ({ id }) => `/admin/reviews/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: "AdminReview", id }],
    }),

    updateReviewStatus: builder.mutation<
      Review,
      { id: string; status: ReviewStatus }
    >({
      query: ({ id, status }) => ({
        url: `/admin/reviews/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, _error, { id }) => moderationTags(result, id),
    }),

    replyToReview: builder.mutation<Review, { id: string; adminReply: string }>(
      {
        query: ({ id, adminReply }) => ({
          url: `/admin/reviews/${id}/reply`,
          method: "PATCH",
          body: { adminReply },
        }),
        invalidatesTags: (result, _error, { id }) => moderationTags(result, id),
      },
    ),

    deleteReview: builder.mutation<
      { id: string; productId: string },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/admin/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, _error, { id }) => moderationTags(result, id),
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetReviewEligibilityQuery,
  useCreateReviewMutation,
  useGetAdminReviewsQuery,
  useGetAdminReviewQuery,
  useUpdateReviewStatusMutation,
  useReplyToReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
