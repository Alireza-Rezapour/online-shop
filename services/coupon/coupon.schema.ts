import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Enums                                                                     */
/* -------------------------------------------------------------------------- */

export const couponTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);
export type CouponType = z.infer<typeof couponTypeSchema>;

/* -------------------------------------------------------------------------- */
/*  Shared rules (used by create schema AND by the service on update)         */
/* -------------------------------------------------------------------------- */

type CouponRuleInput = {
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
};

export type CouponRuleIssue = { path: string; message: string };

/** Cross-field rules. Returns a list of problems (empty = valid). */
export function getCouponRuleIssues(d: CouponRuleInput): CouponRuleIssue[] {
  const issues: CouponRuleIssue[] = [];

  if (d.type === "PERCENTAGE" && d.value > 100) {
    issues.push({
      path: "value",
      message: "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.",
    });
  }
  if (d.type === "FIXED" && !Number.isInteger(d.value)) {
    issues.push({
      path: "value",
      message: "مبلغ تخفیف ثابت باید عدد صحیح باشد.",
    });
  }
  if (d.type === "FIXED" && d.maxDiscount != null) {
    issues.push({
      path: "maxDiscount",
      message: "سقف تخفیف فقط برای کد تخفیف درصدی قابل استفاده است.",
    });
  }
  if (d.startsAt && d.expiresAt && d.startsAt >= d.expiresAt) {
    issues.push({
      path: "expiresAt",
      message: "تاریخ پایان باید بعد از تاریخ شروع باشد.",
    });
  }

  return issues;
}

/* -------------------------------------------------------------------------- */
/*  Admin: create / update                                                    */
/* -------------------------------------------------------------------------- */

const codeSchema = z
  .string()
  .trim()
  .min(3, "کد تخفیف حداقل ۳ کاراکتر باشد.")
  .max(32, "کد تخفیف حداکثر ۳۲ کاراکتر باشد.")
  .transform((v) => v.toUpperCase())
  .refine(
    (v) => /^[A-Z0-9_-]+$/.test(v),
    "کد تخفیف فقط شامل حروف انگلیسی، عدد، _ و - باشد.",
  );

const optionalDate = z.coerce.date().nullable().optional();

const couponFields = z.object({
  code: codeSchema,
  type: couponTypeSchema,
  // PERCENTAGE: 0-100 (decimals allowed) | FIXED: whole amount in the shop's currency unit
  value: z.number().positive("مقدار تخفیف باید بزرگ‌تر از صفر باشد."),
  minOrderAmount: z.number().int().positive().nullable().optional(),
  maxDiscount: z.number().int().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  startsAt: optionalDate,
  expiresAt: optionalDate,
});

export const createCouponSchema = couponFields
  .extend({ isActive: z.boolean().default(true) })
  .superRefine((d, ctx) => {
    for (const issue of getCouponRuleIssues(d)) {
      ctx.addIssue({
        code: "custom",
        path: [issue.path],
        message: issue.message,
      });
    }
  });

// Partial: cross-field rules are re-checked in the service against the merged values.
export const updateCouponSchema = couponFields
  .extend({ isActive: z.boolean() })
  .partial()
  .refine(
    (d) => Object.keys(d).length > 0,
    "حداقل یک فیلد برای ویرایش لازم است.",
  );

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

/* -------------------------------------------------------------------------- */
/*  Admin: list query                                                         */
/* -------------------------------------------------------------------------- */

export const listCouponsQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: couponTypeSchema.optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListCouponsQuery = z.infer<typeof listCouponsQuerySchema>;

/* -------------------------------------------------------------------------- */
/*  Storefront: validate / preview                                            */
/* -------------------------------------------------------------------------- */

// The cart only carries variantId + quantity — the subtotal is always
// recomputed from the DB, never taken from the client.
export const validateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "کد تخفیف را وارد کنید.")
    .transform((v) => v.toUpperCase()),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1, "سبد خرید خالی است."),
});

export type ValidateCouponInput = z.input<typeof validateCouponSchema>;

/* -------------------------------------------------------------------------- */
/*  DTOs (what the API returns; safe to import on the client)                 */
/* -------------------------------------------------------------------------- */

export type CouponStatus =
  | "ACTIVE"
  | "DISABLED"
  | "SCHEDULED"
  | "EXPIRED"
  | "EXHAUSTED";

export type CouponDto = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
};

// Same shape as the orders list: { items, total, page, pageSize, totalPages }
export type CouponListResult = {
  items: CouponDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ListCouponsParams = {
  search?: string;
  type?: CouponType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};

export type ValidateCouponResult = {
  couponId: string;
  code: string;
  type: CouponType;
  subtotal: number;
  discount: number;
};

/* -------------------------------------------------------------------------- */
/*  Request bodies for RTK Query (JSON: dates travel as ISO strings)          */
/* -------------------------------------------------------------------------- */

export type CouponBody = {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
};

export type UpdateCouponBody = Partial<CouponBody>;
