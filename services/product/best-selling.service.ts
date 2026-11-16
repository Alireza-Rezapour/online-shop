import prisma from "@/lib/prisma";
import {
  getFavoriteProductIds,
  storeProductCardSelect,
  toStoreProductCardDto,
  type StoreProductCardRow,
} from "./store-product-card";
import type { StoreProductCardDto } from "./store-product.service";

export type BestSellingOptions = {
  /** How many products to return (1-24, default 10) */
  limit?: number;
  /** Only count orders from the last N days (default 90). 0 = all time */
  days?: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Products ranked by units sold.
 * - Only orders that were really paid count (not PENDING / CANCELLED / RETURNED).
 * - Only published products that still have unreserved stock are returned,
 *   so the home page never advertises something nobody can buy.
 * - Returns fewer than `limit` items (or none) when there are not enough sales.
 */
export async function getBestSellingProductsService(
  options: BestSellingOptions = {},
  userId?: string,
): Promise<StoreProductCardDto[]> {
  const requested = Number.isFinite(options.limit) ? options.limit! : 10;
  const limit = Math.min(Math.max(Math.trunc(requested), 1), 24);

  const days = Number.isFinite(options.days) ? options.days! : 90;
  const since = days > 0 ? new Date(Date.now() - days * DAY_MS) : new Date(0);

  // OrderItem only knows the variant, so sales are summed per product here
  const ranked = await prisma.$queryRaw<{ productId: string }[]>`
    SELECT v."productId" AS "productId"
    FROM "OrderItem" oi
    JOIN "Order" o ON o."id" = oi."orderId"
    JOIN "ProductVariant" v ON v."id" = oi."variantId"
    JOIN "Product" p ON p."id" = v."productId"
    WHERE o."status"::text IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
      AND o."createdAt" >= ${since}
      AND p."isPublished" = true
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" pv
        WHERE pv."productId" = p."id" AND pv."stock" > pv."reservedStock"
      )
    GROUP BY v."productId"
    ORDER BY SUM(oi."quantity") DESC, MAX(o."createdAt") DESC
    LIMIT ${limit}
  `;

  if (ranked.length === 0) return [];

  const ids = ranked.map((r) => r.productId);

  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: ids } },
      select: storeProductCardSelect,
    }),
    getFavoriteProductIds(userId, ids),
  ]);

  // findMany does not keep the ranking order, so restore it
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is StoreProductCardRow => !!p)
    .map((p) => toStoreProductCardDto(p, favoriteIds));
}
