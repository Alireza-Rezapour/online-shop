import type { Prisma } from "@/lib/generated/prisma/client";
import type { StoreProductListQuery } from "./product.schema";
import { getCategoryAndDescendantIds } from "./product-list.service";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  activeCollectionWhere,
  CollectionNotFoundError,
} from "../collection/collection.service";
import {
  available,
  validSale,
  discountPercent,
  variantPrices,
  storeProductCardSelect,
  toStoreProductCardDto,
  getFavoriteProductIds,
} from "./store-product-card";
import { searchProductIds } from "./product-search.service";

/* ------------------------------- types ------------------------------- */

export type StoreColorDto = { id: string; name: string; hex: string };

export type StoreCardColorDto = StoreColorDto & { inStock: boolean };

export type StoreProductCardVariantDto = {
  id: string;
  colorId: string;
  sizeId: string;
  sizeName: string;
  price: number;
  salePrice: number | null;
  availableStock: number;
};

export type StoreProductCardDto = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  hoverImage: string | null;
  coverImageUrl: string | null;
  hoverImageUrl: string | null;
  basePrice: number;
  salePrice: number | null;
  discountPercent: number | null;
  category: { name: string; slug: string };
  // Every color of the product; inStock tells whether it can still be bought
  colors: StoreCardColorDto[];
  // Enough for a quick add on the card (ordered by the size chart order)
  variants: StoreProductCardVariantDto[];
  isAvailable: boolean;
  createdAt: string;
  isFavorite: boolean;
};

export type StoreFacetsDto = {
  colors: { id: string; name: string; hex: string; code: string }[];
  sizeGroups: {
    chart: { id: string; name: string };
    sizes: { id: string; name: string }[];
  }[];
};

export type StoreProductListDto = {
  items: StoreProductCardDto[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type StoreProductVariantDto = {
  id: string;
  sku: string;
  color: StoreColorDto;
  size: { id: string; name: string };
  price: number;
  salePrice: number | null;
  availableStock: number;
};

export type StoreProductDetailDto = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  hoverImage: string | null;
  images: { url: string; alt: string }[];
  basePrice: number;
  salePrice: number | null;
  discountPercent: number | null;
  category: { id: string; name: string; slug: string };
  categoryPath: { id: string; name: string; slug: string }[];
  attributes: { name: string; value: string }[];
  variants: StoreProductVariantDto[];
  isAvailable: boolean;
  isFavorite: boolean;
};

async function getCategoryPath(categoryId: string) {
  const path: { id: string; name: string; slug: string }[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const found: {
      id: string;
      name: string;
      slug: string;
      parentId: string | null;
    } | null = await prisma.category.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, slug: true, parentId: true },
    });
    if (!found) break;
    path.unshift({ id: found.id, name: found.name, slug: found.slug });
    currentId = found.parentId;
  }
  return path;
}

/* -------------------------------- list ------------------------------- */

const orderByMap: Record<
  StoreProductListQuery["sort"],
  Prisma.ProductOrderByWithRelationInput
> = {
  newest: { createdAt: "desc" },
  // Sorted by regular price: Prisma cannot order by "sale price or else base price"
  "price-asc": { basePrice: "asc" },
  "price-desc": { basePrice: "desc" },
  title: { title: "asc" },
  relevance: { createdAt: "desc" },
};

export async function getStoreProductsService(
  query: StoreProductListQuery,
  userId?: string,
): Promise<StoreProductListDto> {
  const {
    page,
    pageSize,
    category,
    collection,
    search,
    minPrice,
    maxPrice,
    inStock,
    colors,
    sizes,
    sort,
    favorites,
  } = query;

  const and: Prisma.ProductWhereInput[] = [{ isPublished: true }];
  if (favorites && userId) and.push({ favorites: { some: { userId } } });

  if (category) {
    const found = await prisma.category.findUnique({
      where: { slug: category },
      select: { id: true },
    });
    if (!found) throw new Error("Category not found");
    and.push({
      categoryId: { in: await getCategoryAndDescendantIds(found.id) },
    });
  }

  if (collection) {
    const found = await prisma.collection.findFirst({
      where: { slug: collection, ...activeCollectionWhere() },
      select: { id: true },
    });
    if (!found) throw new CollectionNotFoundError(collection);
    and.push({ collections: { some: { collectionId: found.id } } });
  }

  let rank: Map<string, number> | null = null;
  if (search) {
    const ids = await searchProductIds(search);
    rank = new Map(ids.map((id, i) => [id, i]));
    and.push({ id: { in: ids } }); // empty list = no results
  }

  // The price a customer sees: the sale price when there is one, else the base price
  if (minPrice != null || maxPrice != null) {
    const range = {
      ...(minPrice != null ? { gte: minPrice } : {}),
      ...(maxPrice != null ? { lte: maxPrice } : {}),
    };
    and.push({
      OR: [{ salePrice: range }, { salePrice: null, basePrice: range }],
    });
  }

  // Color, size and stock must all match on the SAME variant
  const variantWhere: Prisma.ProductVariantWhereInput = {};
  if (inStock)
    variantWhere.stock = { gt: prisma.productVariant.fields.reservedStock };
  if (colors.length > 0) variantWhere.color = { code: { in: colors } };
  if (sizes.length > 0) variantWhere.size = { id: { in: sizes } };
  if (Object.keys(variantWhere).length > 0) {
    and.push({ variants: { some: variantWhere } });
  }

  const where: Prisma.ProductWhereInput = { AND: and };

  let pageIds: string[] | undefined;
  if (sort === "relevance" && rank) {
    const ordered = (
      await prisma.product.findMany({ where, select: { id: true } })
    )
      .map((p) => p.id)
      .sort((a, b) => rank!.get(a)! - rank!.get(b)!);
    pageIds = ordered.slice((page - 1) * pageSize, page * pageSize);
  }

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: pageIds ? { id: { in: pageIds } } : where,
      orderBy: [orderByMap[sort], { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: storeProductCardSelect,
    }),
  ]);

  const favoriteIds = await getFavoriteProductIds(
    userId,
    products.map((p) => p.id),
  );
  const items = products.map((p) => toStoreProductCardDto(p, favoriteIds));

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

/* ------------------------------- detail ------------------------------ */

export async function getStoreProductBySlugService(slug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;

  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      hoverImage: true,
      basePrice: true,
      salePrice: true,
      category: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, alt: true },
      },
      attributes: {
        select: {
          attribute: { select: { name: true } },
          attributeValue: { select: { value: true } },
        },
      },
      variants: {
        select: {
          id: true,
          sku: true,
          price: true,
          salePrice: true,
          stock: true,
          reservedStock: true,
          color: { select: { id: true, name: true, hex: true } },
          size: { select: { id: true, name: true, sortOrder: true } },
        },
      },
      favorites: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
  });
  if (!product) throw new Error("Product not found");

  const isFavorite = product.favorites ? product.favorites.length > 0 : false;

  const variants = [...product.variants]
    .sort(
      (a, b) =>
        a.size.sortOrder - b.size.sortOrder ||
        a.color.name.localeCompare(b.color.name, "fa"),
    )
    .map<StoreProductVariantDto>((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color,
      size: { id: v.size.id, name: v.size.name },
      ...variantPrices(v, product),
      availableStock: available(v),
    }));

  const salePrice = validSale(product.basePrice, product.salePrice);

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    coverImage: product.coverImage,
    hoverImage: product.hoverImage,
    images: product.images,
    basePrice: product.basePrice,
    salePrice,
    discountPercent: discountPercent(product.basePrice, salePrice),
    category: product.category,
    categoryPath: await getCategoryPath(product.category.id),
    attributes: product.attributes.map((a) => ({
      name: a.attribute.name,
      value: a.attributeValue.value,
    })),
    variants,
    isAvailable: variants.some((v) => v.availableStock > 0),
    isFavorite,
  };
}

export async function getStoreFacetsService(
  categorySlug?: string,
): Promise<StoreFacetsDto> {
  let productWhere: Prisma.ProductWhereInput = { isPublished: true };

  if (categorySlug) {
    const found = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (!found) throw new Error("Category not found");
    productWhere = {
      isPublished: true,
      categoryId: { in: await getCategoryAndDescendantIds(found.id) },
    };
  }

  const pairs = await prisma.productVariant.findMany({
    where: { product: productWhere },
    select: { colorId: true, sizeId: true },
    distinct: ["colorId", "sizeId"],
  });

  const colorIds = [...new Set(pairs.map((p) => p.colorId))];
  const sizeIds = [...new Set(pairs.map((p) => p.sizeId))];

  const [colors, sizes] = await Promise.all([
    prisma.color.findMany({
      where: { id: { in: colorIds } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, hex: true, code: true },
    }),
    prisma.size.findMany({
      where: { id: { in: sizeIds } },
      orderBy: [{ sizeChart: { name: "asc" } }, { sortOrder: "asc" }],
      select: {
        id: true,
        name: true,
        sizeChart: { select: { id: true, name: true } },
      },
    }),
  ]);

  const groups = new Map<string, StoreFacetsDto["sizeGroups"][number]>();
  for (const size of sizes) {
    const group = groups.get(size.sizeChart.id) ?? {
      chart: size.sizeChart,
      sizes: [],
    };
    group.sizes.push({ id: size.id, name: size.name });
    groups.set(size.sizeChart.id, group);
  }

  return { colors, sizeGroups: [...groups.values()] };
}
