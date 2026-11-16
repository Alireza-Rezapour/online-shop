import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  OrderItemInput,
  OrderTotals,
  PricedOrderItem,
  VariantWithRelations,
} from "../types";

/**
 * The price rule of the whole shop (the storefront product endpoint uses the same):
 * - a variant without its own price uses the product's price AND the product's sale price
 * - a variant with its own price only uses its own sale price
 * - a sale price counts only when it is lower than the regular price
 */
type PricedVariant = {
  price: number | null;
  salePrice: number | null;
  product: { basePrice: number; salePrice: number | null };
};

export function resolveVariantPrices(variant: PricedVariant) {
  const unitPrice = variant.price ?? variant.product.basePrice;

  const rawSale =
    variant.salePrice ??
    (variant.price == null ? variant.product.salePrice : null);
  const salePrice =
    rawSale != null && rawSale < unitPrice ? rawSale : unitPrice;

  return { unitPrice, salePrice };
}

/**
 * Builds the priced, snapshotted line items for an order using ONLY database
 * data. Nothing the browser sends (price, image) is used or trusted.
 */
export function buildPricedOrderItems(
  items: OrderItemInput[],
  variants: VariantWithRelations[],
): PricedOrderItem[] {
  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  return items.map((item) => {
    const variant = variantById.get(item.variantId);

    if (!variant) {
      // Defensive: the order service already checked this.
      throw new Error(`Product variant not found: ${item.variantId}`);
    }

    const { unitPrice, salePrice } = resolveVariantPrices(variant);

    return {
      variantId: variant.id,
      sku: variant.sku,
      productTitle: variant.product.title,
      colorName: variant.color.name,
      sizeName: variant.size.name,
      unitPrice,
      salePrice,
      quantity: item.quantity,
      lineTotal: salePrice * item.quantity,
      image: variant.product.coverImage ?? "",
    };
  });
}

/**
 * Cost of the carrier the customer picked.
 */
export async function calculateShippingFee(
  tx: Prisma.TransactionClient,
  shippingCarrierId: string,
): Promise<number> {
  const carrier = await tx.carrier.findUnique({
    where: { id: shippingCarrierId },
  });

  if (!carrier) {
    throw new Error("Shipping carrier not found");
  }

  return carrier.cost;
}

/**
 * subtotal = regular prices, discount = sale savings, so the customer pays
 * exactly the sum of the line totals plus shipping. Coupons are applied on
 * top of this in createOrderService.
 */
export function calculateOrderTotals(
  pricedItems: PricedOrderItem[],
  shippingFee: number,
): OrderTotals {
  const subtotal = pricedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const discount = pricedItems.reduce(
    (sum, item) => sum + (item.unitPrice - item.salePrice) * item.quantity,
    0,
  );

  return {
    subtotal,
    discount,
    shippingFee,
    totalPrice: subtotal - discount + shippingFee,
  };
}
