import type { Prisma } from "@/lib/generated/prisma/client";
import type { ProductBasicInput } from "./product.schema";
import prisma from "@/lib/prisma";

type Db = Prisma.TransactionClient;

const productAdminInclude = {
  category: { select: { id: true, name: true, sizeChartId: true } },
  attributes: { select: { attributeId: true, attributeValueId: true } },
  variants: {
    orderBy: [{ createdAt: "asc" }, { sku: "asc" }],
    include: { _count: { select: { orderItems: true } } },
  },
  images: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{
  include: typeof productAdminInclude;
}>;

export type ProductVariantDto = {
  id: string;
  sku: string;
  colorId: string;
  sizeId: string;
  price: number | null;
  salePrice: number | null;
  stock: number;
  reservedStock: number;
  orderItemCount: number;
};

export type ProductAdminDto = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string; sizeChartId: string | null };
  basePrice: number;
  salePrice: number | null;
  coverImage: string | null;
  hoverImage: string | null;
  isPublished: boolean;
  attributes: { attributeId: string; attributeValueId: string }[];
  variants: ProductVariantDto[];
  images: { url: string; alt: string }[];
};

function toDto(p: ProductRecord): ProductAdminDto {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    categoryId: p.categoryId,
    category: p.category,
    basePrice: p.basePrice,
    salePrice: p.salePrice,
    coverImage: p.coverImage,
    hoverImage: p.hoverImage,
    isPublished: p.isPublished,
    attributes: p.attributes,
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      colorId: v.colorId,
      sizeId: v.sizeId,
      price: v.price,
      salePrice: v.salePrice,
      stock: v.stock,
      reservedStock: v.reservedStock,
      orderItemCount: v._count.orderItems,
    })),
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
  };
}

export async function getProductAdminService(
  id: string,
  db: Db = prisma,
): Promise<ProductAdminDto> {
  const product = await db.product.findUnique({
    where: { id },
    include: productAdminInclude,
  });
  if (!product) throw new Error("Product not found");
  return toDto(product);
}

async function assertSlugAvailable(db: Db, slug: string, excludeId?: string) {
  const existing = await db.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing && existing.id !== excludeId) {
    throw new Error("A product with this slug already exists");
  }
}

export async function createProductService(
  input: ProductBasicInput,
): Promise<ProductAdminDto> {
  return prisma.$transaction(async (tx) => {
    await assertSlugAvailable(tx, input.slug);

    const category = await tx.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) throw new Error("Category not found");

    const created = await tx.product.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        categoryId: input.categoryId,
        basePrice: input.basePrice,
        salePrice: input.salePrice ?? null,
        isPublished: false,
      },
      select: { id: true },
    });

    return getProductAdminService(created.id, tx);
  });
}

export async function updateProductBasicService(
  id: string,
  input: ProductBasicInput,
): Promise<ProductAdminDto> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({
      where: { id },
      select: { id: true, categoryId: true },
    });
    if (!existing) throw new Error("Product not found");

    await assertSlugAvailable(tx, input.slug, id);

    if (input.categoryId !== existing.categoryId) {
      const category = await tx.category.findUnique({
        where: { id: input.categoryId },
        select: {
          sizeChartId: true,
          categoryAttributes: { select: { attributeId: true } },
        },
      });
      if (!category) throw new Error("Category not found");

      // Variant sizes must come from the new category's size chart
      const incompatible = await tx.productVariant.count({
        where: {
          productId: id,
          ...(category.sizeChartId
            ? { size: { sizeChartId: { not: category.sizeChartId } } }
            : {}),
        },
      });
      if (incompatible > 0) {
        throw new Error(
          "This product has variants whose sizes do not belong to the new category's size chart. Remove those variants first.",
        );
      }

      // Attributes that the new category does not have are dropped
      await tx.productAttribute.deleteMany({
        where: {
          productId: id,
          attributeId: {
            notIn: category.categoryAttributes.map((a) => a.attributeId),
          },
        },
      });
    }

    await tx.product.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        categoryId: input.categoryId,
        basePrice: input.basePrice,
        salePrice: input.salePrice ?? null,
      },
    });

    return getProductAdminService(id, tx);
  });
}

export async function setProductPublishedService(
  id: string,
  isPublished: boolean,
): Promise<ProductAdminDto> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { coverImage: true, _count: { select: { variants: true } } },
  });
  if (!product) throw new Error("Product not found");

  if (isPublished) {
    if (!product.coverImage) {
      throw new Error("A cover image is required to publish this product");
    }
    if (product._count.variants === 0) {
      throw new Error(
        "At least one variant is required to publish this product",
      );
    }
  }

  await prisma.product.update({ where: { id }, data: { isPublished } });
  return getProductAdminService(id);
}
