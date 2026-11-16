import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { Coupon } from "@/lib/generated/prisma/client";
import {
  getCouponRuleIssues,
  type CouponDto,
  type CouponListResult,
  type CouponStatus,
  type CreateCouponInput,
  type ListCouponsQuery,
  type UpdateCouponInput,
  type ValidateCouponInput,
  type ValidateCouponResult,
} from "./coupon.schema";

// Works with both `prisma` and an interactive-transaction client (`tx`).
type Db = Prisma.TransactionClient;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

function getStatus(c: Coupon, now = new Date()): CouponStatus {
  if (!c.isActive) return "DISABLED";
  if (c.startsAt && c.startsAt > now) return "SCHEDULED";
  if (c.expiresAt && c.expiresAt <= now) return "EXPIRED";
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return "EXHAUSTED";
  return "ACTIVE";
}

/** Prisma Decimal -> plain number, so the JSON the client gets is numeric. */
function toDto(c: Coupon): CouponDto {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value.toNumber(),
    minOrderAmount: c.minOrderAmount?.toNumber() ?? null,
    maxDiscount: c.maxDiscount?.toNumber() ?? null,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    startsAt: c.startsAt?.toISOString() ?? null,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    isActive: c.isActive,
    status: getStatus(c),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Admin CRUD                                                                */
/* -------------------------------------------------------------------------- */

export async function listCoupons(
  query: ListCouponsQuery,
): Promise<CouponListResult> {
  const { search, type, isActive, page, pageSize } = query;

  const where: Prisma.CouponWhereInput = {
    ...(search ? { code: { contains: search.toUpperCase() } } : {}),
    ...(type ? { type } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.coupon.findMany({
      where,
      // id as tie-breaker keeps pages stable when createdAt values collide
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.coupon.count({ where }),
  ]);

  return {
    items: rows.map(toDto),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCoupon(id: string): Promise<CouponDto> {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new Error("کد تخفیف پیدا نشد.");
  return toDto(coupon);
}

export async function createCoupon(
  input: CreateCouponInput,
): Promise<CouponDto> {
  try {
    const coupon = await prisma.coupon.create({ data: input });
    return toDto(coupon);
  } catch (e) {
    if (isUniqueViolation(e))
      throw new Error("این کد تخفیف قبلاً ثبت شده است.");
    throw e;
  }
}

export async function updateCoupon(
  id: string,
  input: UpdateCouponInput,
): Promise<CouponDto> {
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw new Error("کد تخفیف پیدا نشد.");

  const data: Prisma.CouponUpdateInput = { ...input };

  // A max-discount cap only makes sense for percentage coupons.
  if (input.type === "FIXED") data.maxDiscount = null;

  // Re-check the cross-field rules against the merged result.
  const merged = {
    type: input.type ?? existing.type,
    value: input.value ?? existing.value.toNumber(),
    maxDiscount:
      data.maxDiscount === null
        ? null
        : input.maxDiscount !== undefined
          ? input.maxDiscount
          : (existing.maxDiscount?.toNumber() ?? null),
    startsAt: input.startsAt !== undefined ? input.startsAt : existing.startsAt,
    expiresAt:
      input.expiresAt !== undefined ? input.expiresAt : existing.expiresAt,
  };
  const issues = getCouponRuleIssues(merged);
  if (issues.length > 0) throw new Error(issues[0].message);

  if (
    input.usageLimit !== undefined &&
    input.usageLimit !== null &&
    input.usageLimit < existing.usedCount
  ) {
    throw new Error(
      "سقف استفاده نمی‌تواند کمتر از تعداد دفعات استفاده‌شده باشد.",
    );
  }

  try {
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return toDto(coupon);
  } catch (e) {
    if (isUniqueViolation(e))
      throw new Error("این کد تخفیف قبلاً ثبت شده است.");
    throw e;
  }
}

export async function deleteCoupon(id: string): Promise<{ id: string }> {
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw new Error("کد تخفیف پیدا نشد.");

  if (existing.usedCount > 0) {
    throw new Error("کد تخفیفِ استفاده‌شده قابل حذف نیست؛ آن را غیرفعال کنید.");
  }

  await prisma.coupon.delete({ where: { id } });
  return { id };
}

/* -------------------------------------------------------------------------- */
/*  Discount calculation + validation (used by checkout and createOrderService) */
/* -------------------------------------------------------------------------- */

export type EvaluatedCoupon = {
  couponId: string;
  code: string;
  discount: number;
  usageLimit: number | null;
};

export type AppliedCoupon = {
  couponId: string;
  code: string;
  discount: number;
};

/** Pure: how much `coupon` takes off `subtotal`. Never exceeds the subtotal. */
export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  const value = coupon.value.toNumber();

  let discount =
    coupon.type === "PERCENTAGE"
      ? Math.floor((subtotal * value) / 100)
      : Math.floor(value);

  if (coupon.type === "PERCENTAGE" && coupon.maxDiscount) {
    discount = Math.min(discount, Math.floor(coupon.maxDiscount.toNumber()));
  }

  return Math.max(0, Math.min(discount, subtotal));
}

/**
 * Read-only check of a coupon against a subtotal. Nothing is consumed.
 * `userId` is optional so a visitor who is not logged in can still preview a
 * coupon; the per-user rule is then enforced when the order is created.
 * `subtotal` MUST be computed on the server (after sale prices).
 */
export async function evaluateCoupon(
  db: Db,
  input: { code: string; subtotal: number; userId?: string },
): Promise<EvaluatedCoupon> {
  const { code, subtotal, userId } = input;
  const now = new Date();

  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon || !coupon.isActive) throw new Error("کد تخفیف معتبر نیست.");

  if (coupon.startsAt && coupon.startsAt > now) {
    throw new Error("زمان استفاده از این کد تخفیف هنوز شروع نشده است.");
  }
  if (coupon.expiresAt && coupon.expiresAt <= now)
    throw new Error("این کد تخفیف منقضی شده است.");

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount.toNumber()) {
    throw new Error(
      `حداقل مبلغ سفارش برای این کد تخفیف ${coupon.minOrderAmount
        .toNumber()
        .toLocaleString("fa-IR")} است.`,
    );
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("ظرفیت استفاده از این کد تخفیف تمام شده است.");
  }

  if (userId) {
    const alreadyUsed = await db.couponUser.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId } },
    });
    if (alreadyUsed)
      throw new Error("شما قبلاً از این کد تخفیف استفاده کرده‌اید.");
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    discount: calculateDiscount(coupon, subtotal),
    usageLimit: coupon.usageLimit,
  };
}

/**
 * Evaluates the coupon and consumes one use of it. Must run inside the order
 * transaction, so a failed order never burns a coupon.
 */
export async function applyCoupon(
  tx: Db,
  input: { code: string; userId: string; subtotal: number },
): Promise<AppliedCoupon> {
  const evaluated = await evaluateCoupon(tx, input);

  // Atomic: two simultaneous orders can never both take the last use
  const claimed = await tx.coupon.updateMany({
    where: {
      id: evaluated.couponId,
      ...(evaluated.usageLimit !== null
        ? { usedCount: { lt: evaluated.usageLimit } }
        : {}),
    },
    data: { usedCount: { increment: 1 } },
  });
  if (claimed.count === 0)
    throw new Error("ظرفیت استفاده از این کد تخفیف تمام شده است.");

  try {
    await tx.couponUser.create({
      data: { couponId: evaluated.couponId, userId: input.userId },
    });
  } catch (e) {
    if (isUniqueViolation(e))
      throw new Error("شما قبلاً از این کد تخفیف استفاده کرده‌اید.");
    throw e;
  }

  return {
    couponId: evaluated.couponId,
    code: evaluated.code,
    discount: evaluated.discount,
  };
}

/** Gives the use back (e.g. the order was cancelled). Safe to call twice. */
export async function releaseCoupon(
  db: Db,
  couponId: string,
  userId: string,
): Promise<void> {
  const { count } = await db.couponUser.deleteMany({
    where: { couponId, userId },
  });
  if (count > 0) {
    await db.coupon.updateMany({
      where: { id: couponId, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  }
}

/* -------------------------------------------------------------------------- */
/*  Storefront preview ("apply coupon" button in the cart / checkout)         */
/* -------------------------------------------------------------------------- */

/**
 * Subtotal from DB prices (after sale prices).
 * NOTE: keep this price rule identical to the one in createOrderService.
 */
async function calculateCartSubtotal(
  items: ValidateCouponInput["items"],
  db: Db,
): Promise<number> {
  const variants = await db.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  let subtotal = 0;
  for (const item of items) {
    const v = byId.get(item.variantId);
    if (!v || !v.product.isPublished)
      throw new Error("یکی از محصولات سبد خرید در دسترس نیست.");

    const unitPrice =
      v.salePrice ?? v.price ?? v.product.salePrice ?? v.product.basePrice;
    subtotal += unitPrice * item.quantity;
  }
  return subtotal;
}

export async function previewCoupon(
  userId: string | undefined,
  input: ValidateCouponInput,
): Promise<ValidateCouponResult> {
  const subtotal = await calculateCartSubtotal(input.items, prisma);
  const evaluated = await evaluateCoupon(prisma, {
    code: input.code,
    subtotal,
    userId,
  });

  const coupon = await prisma.coupon.findUniqueOrThrow({
    where: { id: evaluated.couponId },
    select: { type: true },
  });

  return {
    couponId: evaluated.couponId,
    code: evaluated.code,
    type: coupon.type,
    subtotal,
    discount: evaluated.discount,
  };
}
