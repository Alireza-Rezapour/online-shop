import prisma from "@/lib/prisma";
import { resolveVariantPrices } from "../helpers/calculatePricing";
import type { CartValidationRequest } from "./cartValidation.schema";
import { evaluateCoupon } from "../coupon/coupon.service";

export type CouponErrorCode =
  | "NOT_FOUND"
  | "INACTIVE"
  | "NOT_STARTED"
  | "EXPIRED"
  | "USAGE_LIMIT_REACHED"
  | "USER_LIMIT_REACHED"
  | "MIN_ORDER_NOT_MET";

export class CouponError extends Error {
  constructor(
    public code: CouponErrorCode,
    message: string,
    public minOrderAmount?: number,
  ) {
    super(message);
    this.name = "CouponError";
  }
}

export type CartValidationItemDto = {
  variantId: string;
  purchasable: boolean;
  price: number;
  salePrice: number | null;
  availableStock: number;
};

export type CartValidationDto = {
  items: CartValidationItemDto[];
  coupon: { code: string; discount: number } | null;
  couponError: {
    code: CouponErrorCode;
    message: string;
    minOrderAmount?: number;
  } | null;
};

/**
 * Tells the cart what an order would cost RIGHT NOW. It uses the same price
 * rule and stock rule as order creation, so the cart never shows a number the
 * checkout will not honour. Nothing is reserved or consumed here.
 */
export async function validateCartService(
  input: CartValidationRequest & { userId?: string },
): Promise<CartValidationDto> {
  const requested = new Map<string, number>();
  for (const item of input.items) {
    requested.set(
      item.variantId,
      (requested.get(item.variantId) ?? 0) + item.quantity,
    );
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: [...requested.keys()] } },
    select: {
      id: true,
      price: true,
      salePrice: true,
      stock: true,
      reservedStock: true,
      product: {
        select: { isPublished: true, basePrice: true, salePrice: true },
      },
    },
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  // What the customer would pay for the items, with quantities capped by stock
  let payable = 0;

  const items = [...requested].map(
    ([variantId, quantity]): CartValidationItemDto => {
      const variant = variantById.get(variantId);

      if (!variant || !variant.product.isPublished) {
        return {
          variantId,
          purchasable: false,
          price: 0,
          salePrice: null,
          availableStock: 0,
        };
      }

      const { unitPrice, salePrice } = resolveVariantPrices(variant);
      const availableStock = Math.max(variant.stock - variant.reservedStock, 0);

      payable += salePrice * Math.min(quantity, availableStock);

      return {
        variantId,
        purchasable: true,
        price: unitPrice,
        salePrice: salePrice < unitPrice ? salePrice : null,
        availableStock,
      };
    },
  );

  let coupon: CartValidationDto["coupon"] = null;
  let couponError: CartValidationDto["couponError"] = null;

  if (input.couponCode?.trim()) {
    try {
      const evaluated = await evaluateCoupon(prisma, {
        code: input.couponCode,
        subtotal: payable,
        userId: input.userId,
      });
      coupon = { code: evaluated.code, discount: evaluated.discount };
    } catch (error) {
      if (!(error instanceof CouponError)) throw error;
      couponError = {
        code: error.code,
        message: error.message,
        minOrderAmount: error.minOrderAmount,
      };
    }
  }

  return { items, coupon, couponError };
}
