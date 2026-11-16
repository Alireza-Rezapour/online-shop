import type { OrderItemInput, VariantWithRelations } from "../types";

/**
 * Validates that every requested item is a real, published variant with a
 * valid quantity and enough AVAILABLE stock (stock minus units reserved by
 * pending payments).
 *
 * Throws a plain Error with a descriptive message on the first failure.
 */
export function validateOrderItems(
  items: OrderItemInput[],
  variants: VariantWithRelations[],
): void {
  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(
        `Invalid quantity for variant ${item.variantId}: quantity must be a whole number greater than 0.`,
      );
    }

    const variant = variantById.get(item.variantId);

    // "no longer available" on purpose: the error handler turns any message
    // containing "not found" into a 404, and a stale cart item is a 400
    if (!variant || !variant.product.isPublished) {
      throw new Error(
        `One of the items in your cart is no longer available (variant ${item.variantId}).`,
      );
    }

    const available = Math.max(variant.stock - variant.reservedStock, 0);

    if (available < item.quantity) {
      const name = `${variant.product.title} - ${variant.color.name} / ${variant.size.name}`;
      throw new Error(
        available === 0
          ? `"${name}" is out of stock.`
          : `Insufficient stock for "${name}". Requested ${item.quantity}, only ${available} available.`,
      );
    }
  }
}
