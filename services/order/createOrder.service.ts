import { AppliedCoupon, applyCoupon } from "../coupon/coupon.service";
import {
  buildPricedOrderItems,
  calculateOrderTotals,
  calculateShippingFee,
} from "../helpers/calculatePricing";
import { generateOrderNumber } from "../helpers/generateOrderNumber";
import { validateOrderItems } from "../helpers/validateOrderItems";
import {
  CreateOrderInput,
  CreateOrderResult,
  VariantWithRelations,
} from "../types";
import prisma from "@/lib/prisma";

/**
 * Creates a PENDING order from a cart of { variantId, quantity } pairs.
 * Prices always come from the database. Shipping address and items are stored
 * as snapshots. Payment and Shipment are created later.
 */
export async function createOrderService(
  input: CreateOrderInput & { couponCode?: string },
): Promise<CreateOrderResult> {
  const { userId, shippingAddress, shippingCarrierId, couponCode } = input;

  // The same variant twice in the cart becomes one line with the summed quantity
  const merged = new Map<string, number>();
  for (const item of input.items) {
    merged.set(
      item.variantId,
      (merged.get(item.variantId) ?? 0) + item.quantity,
    );
  }
  const items = [...merged].map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));

  if (!items.length) {
    throw new Error("Cannot create an order with an empty cart.");
  }

  return prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx);

    const variants: VariantWithRelations[] = await tx.productVariant.findMany({
      where: { id: { in: items.map((item) => item.variantId) } },
      include: { product: true, color: true, size: true },
    });

    validateOrderItems(items, variants);

    // Drafts are not for sale, and only unreserved stock can be bought
    const variantById = new Map(variants.map((v) => [v.id, v]));
    for (const item of items) {
      const variant = variantById.get(item.variantId);
      if (!variant) throw new Error(`Variant not found: ${item.variantId}`);

      if (!variant.product.isPublished) {
        throw new Error(`"${variant.product.title}" is not available.`);
      }
      if (variant.stock - variant.reservedStock < item.quantity) {
        throw new Error(`Insufficient stock for "${variant.product.title}".`);
      }
    }

    const pricedItems = buildPricedOrderItems(items, variants);
    const shippingFee = await calculateShippingFee(tx, shippingCarrierId);
    const totals = calculateOrderTotals(pricedItems, shippingFee);

    // The coupon applies to what the items cost after their sale prices
    let coupon: AppliedCoupon | null = null;
    if (couponCode?.trim()) {
      coupon = await applyCoupon(tx, {
        code: couponCode,
        userId,
        subtotal: totals.subtotal - totals.discount,
      });
    }

    // Order.discount = sale savings + coupon; couponCode tells a coupon was used
    const discount = totals.discount + (coupon?.discount ?? 0);
    const totalPrice = totals.subtotal - discount + totals.shippingFee;

    const order = await tx.order.create({
      data: {
        userId,
        status: "PENDING",
        orderNumber,

        subtotal: totals.subtotal,
        discount,
        shippingFee: totals.shippingFee,
        totalPrice,

        couponId: coupon?.couponId ?? null,
        couponCode: coupon?.code ?? null,

        shippingReceiverName: shippingAddress.receiverName,
        shippingPhone: shippingAddress.phone,
        shippingProvince: shippingAddress.province,
        shippingCity: shippingAddress.city,
        shippingAddress: shippingAddress.address,
        shippingPostalCode: shippingAddress.postalCode,

        items: {
          create: pricedItems.map((item) => ({
            variantId: item.variantId,
            sku: item.sku,
            productTitle: item.productTitle,
            colorName: item.colorName,
            sizeName: item.sizeName,
            unitPrice: item.unitPrice,
            salePrice: item.salePrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            image: item.image,
          })),
        },
      },
      select: { id: true },
    });

    return { orderId: order.id, totalPrice };
  });
}
