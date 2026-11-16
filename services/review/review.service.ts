import type { Prisma } from "@/lib/generated/prisma/client";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import type {
  AdminListReviewsQuery,
  CreateReviewBody,
  ProductReviewsQuery,
  ReplyToReviewBody,
} from "./review.schema";

/**
 * true  -> only people who bought the product can review it (matches the storefront UI)
 * false -> anyone can review; reviews without a purchase are saved as unverified
 */
const REQUIRE_PURCHASE_TO_REVIEW = true;

/* ------------------------------ helpers ------------------------------ */

// Prisma error codes without importing the runtime error class
const hasPrismaCode = (e: unknown, code: string) =>
  typeof e === "object" && e !== null && (e as { code?: string }).code === code;

const productSelect = { id: true, title: true, slug: true } as const;
const publicUserSelect = { id: true, name: true, image: true } as const;
const adminUserSelect = { id: true, name: true, email: true } as const;

async function updateReviewOrThrow(
  reviewId: string,
  data: Prisma.ReviewUpdateInput,
) {
  try {
    return await prisma.review.update({ where: { id: reviewId }, data });
  } catch (e) {
    if (hasPrismaCode(e, "P2025")) throw new Error("Review not found");
    throw e;
  }
}

/* ------------------------- purchase / eligibility ------------------------- */

/**
 * A user counts as a verified purchaser of a product if they have an Order
 * with status PAID or DELIVERED that contains at least one item whose
 * variant belongs to that product.
 */
export async function checkVerifiedPurchase(
  userId: string,
  productId: string,
): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: { in: ["PAID", "DELIVERED"] },
      items: { some: { variant: { productId } } },
    },
    select: { id: true },
  });

  return !!order;
}

export async function getReviewEligibilityService({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  const [hasPurchased, existingReview] = await Promise.all([
    checkVerifiedPurchase(userId, productId),
    prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
      select: { id: true },
    }),
  ]);

  const alreadyReviewed = !!existingReview;

  return {
    hasPurchased,
    alreadyReviewed,
    canReview:
      (hasPurchased || !REQUIRE_PURCHASE_TO_REVIEW) && !alreadyReviewed,
  };
}

/* ------------------------------ storefront ------------------------------ */

export type CreateReviewInput = CreateReviewBody & {
  userId: string;
  productId: string;
};

export async function createReviewService({
  userId,
  productId,
  rating,
  title,
  comment,
}: CreateReviewInput) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw new Error("Product not found");

  const { hasPurchased, alreadyReviewed } = await getReviewEligibilityService({
    userId,
    productId,
  });
  if (alreadyReviewed)
    throw new Error("You have already reviewed this product");
  if (REQUIRE_PURCHASE_TO_REVIEW && !hasPurchased) {
    throw new Error("You can only review products you have purchased");
  }

  try {
    return await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title,
        comment,
        isVerifiedPurchase: hasPurchased,
        status: "PENDING", // shown in the store only after an admin approves it
      },
    });
  } catch (e) {
    // Two requests at once: the unique (productId, userId) index catches the second
    if (hasPrismaCode(e, "P2002")) {
      throw new Error("You have already reviewed this product");
    }
    throw e;
  }
}

export async function getProductReviewsService({
  productId,
  page = 1,
  limit = 10,
}: { productId: string } & Partial<ProductReviewsQuery>) {
  const where = { productId, status: "APPROVED" } as const;

  const [reviews, total, aggregate, distribution] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { user: { select: publicUserSelect } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({ where, _avg: { rating: true } }),
    prisma.review.groupBy({
      by: ["rating"],
      where,
      _count: { rating: true },
    }),
  ]);

  return {
    reviews,
    total,
    page,
    limit,
    averageRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
    ratingDistribution: distribution.map((d) => ({
      rating: d.rating,
      count: d._count.rating,
    })),
  };
}

/* -------------------------------- admin -------------------------------- */

const adminInclude = {
  product: { select: productSelect },
  user: { select: adminUserSelect },
} as const;

export async function adminListReviewsService({
  status,
  productId,
  userId,
  page = 1,
  limit = 20,
}: Partial<AdminListReviewsQuery>) {
  const where: Prisma.ReviewWhereInput = {
    ...(status ? { status } : {}),
    ...(productId ? { productId } : {}),
    ...(userId ? { userId } : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: adminInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, page, limit };
}

export async function getAdminReviewByIdService(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: adminInclude,
  });
  if (!review) throw new Error("Review not found");
  return review;
}

export async function updateReviewStatusService({
  reviewId,
  status,
}: {
  reviewId: string;
  status: ReviewStatus;
}) {
  return updateReviewOrThrow(reviewId, { status });
}

export async function replyToReviewService({
  reviewId,
  adminReply,
}: { reviewId: string } & ReplyToReviewBody) {
  // An empty reply clears the shop reply
  return updateReviewOrThrow(reviewId, {
    adminReply: adminReply.trim() || null,
  });
}

export async function deleteReviewService(reviewId: string) {
  try {
    // productId lets the client refresh that product's storefront reviews too
    const { id, productId } = await prisma.review.delete({
      where: { id: reviewId },
      select: { id: true, productId: true },
    });
    return { id, productId };
  } catch (e) {
    if (hasPrismaCode(e, "P2025")) throw new Error("Review not found");
    throw e;
  }
}
