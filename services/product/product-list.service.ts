import type { Prisma } from "@/lib/generated/prisma/client";
import type { ProductListQuery } from "./product.schema";
import prisma from "@/lib/prisma";

export type ProductListItemDto = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  category: { id: string; name: string };
  basePrice: number;
  salePrice: number | null;
  isPublished: boolean;
  variantCount: number;
  availableStock: number;
  createdAt: string;
};

export type ProductListDto = {
  items: ProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

const orderByMap: Record<
  ProductListQuery["sort"],
  Prisma.ProductOrderByWithRelationInput
> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "price-asc": { basePrice: "asc" },
  "price-desc": { basePrice: "desc" },
  title: { title: "asc" },
  relevance: { title: "desc" },
};

export async function getCategoryAndDescendantIds(
  categoryId: string,
): Promise<string[]> {
  const all = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });

  const childrenOf = new Map<string, string[]>();
  for (const c of all) {
    if (!c.parentId) continue;
    childrenOf.set(c.parentId, [...(childrenOf.get(c.parentId) ?? []), c.id]);
  }

  const result: string[] = [];
  const queue = [categoryId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    queue.push(...(childrenOf.get(id) ?? []));
  }
  return result;
}

export async function listProductsService(
  query: ProductListQuery,
): Promise<ProductListDto> {
  const { page, pageSize, search, categoryId, status, sort } = query;

  const where: Prisma.ProductWhereInput = {};

  if (status === "published") where.isPublished = true;
  if (status === "draft") where.isPublished = false;

  if (categoryId) {
    where.categoryId = { in: await getCategoryAndDescendantIds(categoryId) };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      {
        variants: { some: { sku: { contains: search, mode: "insensitive" } } },
      },
    ];
  }

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [orderByMap[sort], { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        basePrice: true,
        salePrice: true,
        isPublished: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        variants: { select: { stock: true, reservedStock: true } },
      },
    }),
  ]);

  return {
    items: products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      coverImage: p.coverImage,
      category: p.category,
      basePrice: p.basePrice,
      salePrice: p.salePrice,
      isPublished: p.isPublished,
      variantCount: p.variants.length,
      availableStock: p.variants.reduce(
        (sum, v) => sum + Math.max(v.stock - v.reservedStock, 0),
        0,
      ),
      createdAt: p.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function deleteProductService(
  id: string,
): Promise<{ id: string }> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!product) throw new Error("Product not found");

  // Order items reference variants with Restrict, so a sold product must be kept
  const orderItems = await prisma.orderItem.count({
    where: { variant: { productId: id } },
  });
  if (orderItems > 0) {
    throw new Error(
      "This product has orders and cannot be deleted. Unpublish it instead.",
    );
  }

  // Variants, images, attributes, favorites, reviews and look items are removed by cascade
  await prisma.product.delete({ where: { id } });
  return { id };
}
