import { z } from "zod";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";

// `satisfies` makes TypeScript fail here if a value is not in the Prisma ReviewStatus enum
export const REVIEW_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const satisfies readonly ReviewStatus[];

export const reviewStatusSchema = z.enum(REVIEW_STATUSES);

/* ----------------------------- shared bits ---------------------------- */

// Query strings arrive as text. Parse them with Object.fromEntries(url.searchParams),
// NOT searchParams.get(...) (a missing key would become null and fail coercion).
const pageSchema = z.coerce.number().int().min(1).default(1);
const limitSchema = (fallback: number, max: number) =>
  z.coerce.number().int().min(1).max(max).default(fallback);

/* ------------------------------ storefront ---------------------------- */

export const productReviewsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema(10, 50),
});

export const createReviewSchema = z.object({
  rating: z
    .number({ message: "لطفا امتیاز خود را انتخاب کنید" })
    .int()
    .min(1, "لطفا امتیاز خود را انتخاب کنید")
    .max(5),
  // An empty title is saved as "no title"
  title: z
    .string()
    .trim()
    .max(100, "عنوان نباید بیشتر از ۱۰۰ نویسه باشد")
    .optional()
    .transform((v) => v || undefined),
  comment: z
    .string()
    .trim()
    .min(1, "لطفا متن نظر را وارد کنید")
    .max(2000, "نظر نباید بیشتر از ۲۰۰۰ نویسه باشد"),
});

/* -------------------------------- admin ------------------------------- */

export const adminListReviewsQuerySchema = z.object({
  status: reviewStatusSchema.optional(),
  productId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  page: pageSchema,
  limit: limitSchema(20, 100),
});

export const updateReviewStatusSchema = z.object({
  status: reviewStatusSchema,
});

// An empty reply removes the shop reply
export const replyToReviewSchema = z.object({
  adminReply: z
    .string()
    .trim()
    .max(1000, "پاسخ نباید بیشتر از ۱۰۰۰ نویسه باشد"),
});

/* -------------------------------- types ------------------------------- */

export type ProductReviewsQuery = z.infer<typeof productReviewsQuerySchema>;
export type CreateReviewBody = z.infer<typeof createReviewSchema>;
export type AdminListReviewsQuery = z.infer<typeof adminListReviewsQuerySchema>;
export type UpdateReviewStatusBody = z.infer<typeof updateReviewStatusSchema>;
export type ReplyToReviewBody = z.infer<typeof replyToReviewSchema>;
