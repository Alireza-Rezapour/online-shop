import type { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getPublicUrl } from "../storage/storage.public-url";
import type {
  StoreCardColorDto,
  StoreProductCardDto,
} from "./store-product.service";

/* ------------------------------ helpers ------------------------------ */
// Moved here from store-product.service.ts so the list, the detail and the
// best-selling service all share the exact same pricing / stock rules.

export const available = (v: { stock: number; reservedStock: number }) =>
  Math.max(v.stock - v.reservedStock, 0);

// A sale price only counts when it is really lower than the regular price
export function validSale(price: number, sale: number | null): number | null {
  return sale != null && sale < price ? sale : null;
}

export function discountPercent(
  price: number,
  sale: number | null,
): number | null {
  return sale != null ? Math.round((1 - sale / price) * 100) : null;
}

/**
 * Variant pricing rule (same as the admin wizard):
 * - no own price      -> product price, and the product sale price if it has none of its own
 * - has its own price -> only its own sale price applies
 */
export function variantPrices(
  variant: { price: number | null; salePrice: number | null },
  product: { basePrice: number; salePrice: number | null },
) {
  const price = variant.price ?? product.basePrice;
  const rawSale =
    variant.salePrice ?? (variant.price == null ? product.salePrice : null);
  return { price, salePrice: validSale(price, rawSale) };
}

/* ----------------------------- card shape ---------------------------- */

export const storeProductCardSelect = {
  id: true,
  title: true,
  slug: true,
  coverImage: true,
  hoverImage: true,
  basePrice: true,
  salePrice: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  variants: {
    select: {
      id: true,
      price: true,
      salePrice: true,
      stock: true,
      reservedStock: true,
      color: { select: { id: true, name: true, hex: true } },
      size: { select: { id: true, name: true, sortOrder: true } },
    },
  },
} satisfies Prisma.ProductSelect;

export type StoreProductCardRow = Prisma.ProductGetPayload<{
  select: typeof storeProductCardSelect;
}>;

export async function getFavoriteProductIds(
  userId: string | undefined,
  productIds: string[],
): Promise<Set<string>> {
  if (!userId || productIds.length === 0) return new Set<string>();

  const rows = await prisma.favorite.findMany({
    where: { userId, productId: { in: productIds } },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}

export function toStoreProductCardDto(
  p: StoreProductCardRow,
  favoriteIds: Set<string>,
): StoreProductCardDto {
  const variants = [...p.variants].sort(
    (a, b) => a.size.sortOrder - b.size.sortOrder,
  );

  const colorById = new Map<string, StoreCardColorDto>();
  for (const v of variants) {
    const known = colorById.get(v.color.id);
    colorById.set(v.color.id, {
      ...v.color,
      inStock: available(v) > 0 || !!known?.inStock,
    });
  }

  const salePrice = validSale(p.basePrice, p.salePrice);

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    coverImage: p.coverImage,
    hoverImage: p.hoverImage,
    coverImageUrl: getPublicUrl(p.coverImage),
    hoverImageUrl: getPublicUrl(p.hoverImage),
    basePrice: p.basePrice,
    salePrice,
    discountPercent: discountPercent(p.basePrice, salePrice),
    category: p.category,
    colors: [...colorById.values()],
    variants: variants.map((v) => ({
      id: v.id,
      colorId: v.color.id,
      sizeId: v.size.id,
      sizeName: v.size.name,
      ...variantPrices(v, p),
      availableStock: available(v),
    })),
    isAvailable: variants.some((v) => available(v) > 0),
    createdAt: p.createdAt.toISOString(),
    isFavorite: favoriteIds.has(p.id),
  };
}
