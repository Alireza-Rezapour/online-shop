import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  CategoryQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema";
import prisma from "@/lib/prisma";
import { getPublicUrl } from "../storage/storage.public-url";

const categoryInclude = {
  sizeChart: { select: { id: true, name: true } },
  categoryAttributes: {
    include: { attribute: { select: { id: true, name: true } } },
  },
  _count: { select: { products: true, children: true } },
} satisfies Prisma.CategoryInclude;

type CategoryRecord = Prisma.CategoryGetPayload<{
  include: typeof categoryInclude;
}>;

export type CategoryDto = Omit<CategoryRecord, "categoryAttributes"> & {
  imageUrl: string | null;
  attributes: { id: string; name: string }[];
};

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  children: CategoryTreeNode[];
  imageUrl: string | null;
};

function toDto(category: CategoryRecord): CategoryDto {
  const { categoryAttributes, ...rest } = category;
  return {
    ...rest,
    imageUrl: getPublicUrl(category.image),
    attributes: categoryAttributes.map((ca) => ca.attribute),
  };
}

/* ----------------------------- helpers ----------------------------- */

// Walks up from newParentId; if we reach categoryId, the move would create a loop.
async function assertNoCycle(
  tx: Prisma.TransactionClient,
  categoryId: string,
  newParentId: string,
) {
  let currentId: string | null = newParentId;

  while (currentId) {
    if (currentId === categoryId) {
      throw new Error(
        "A category cannot be moved under itself or its own child",
      );
    }
    const parent: { parentId: string | null } | null =
      await tx.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
    currentId = parent?.parentId ?? null;
  }
}

async function assertRelationsExist(
  tx: Prisma.TransactionClient,
  data: {
    parentId?: string | null;
    sizeChartId?: string | null;
    attributeIds?: string[];
  },
) {
  if (data.parentId) {
    const parent = await tx.category.findUnique({
      where: { id: data.parentId },
      select: { id: true },
    });
    if (!parent) throw new Error("Parent category not found");
  }

  if (data.sizeChartId) {
    const chart = await tx.sizeChart.findUnique({
      where: { id: data.sizeChartId },
      select: { id: true },
    });
    if (!chart) throw new Error("Size chart not found");
  }

  if (data.attributeIds && data.attributeIds.length > 0) {
    const unique = [...new Set(data.attributeIds)];
    const count = await tx.attribute.count({ where: { id: { in: unique } } });
    if (count !== unique.length)
      throw new Error("One or more attributes not found");
  }
}

async function assertSlugAvailable(
  tx: Prisma.TransactionClient,
  slug: string,
  excludeId?: string,
) {
  const existing = await tx.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing && existing.id !== excludeId) {
    throw new Error("A category with this slug already exists");
  }
}

/* ------------------------------ queries ----------------------------- */

export async function getCategoriesService(
  query: CategoryQuery,
): Promise<CategoryDto[] | CategoryTreeNode[]> {
  if (query.tree) {
    const all = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, image: true, parentId: true },
      orderBy: { name: "asc" },
    });

    const nodes = new Map<string, CategoryTreeNode>(
      all.map((c) => [
        c.id,
        { ...c, imageUrl: getPublicUrl(c.image), children: [] },
      ]),
    );
    const roots: CategoryTreeNode[] = [];

    for (const node of nodes.values()) {
      const parent = node.parentId ? nodes.get(node.parentId) : undefined;
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
    return roots;
  }

  const where: Prisma.CategoryWhereInput = {};

  if (query.parentId === "root") where.parentId = null;
  else if (query.parentId) where.parentId = query.parentId;

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { slug: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const categories = await prisma.category.findMany({
    where,
    include: categoryInclude,
    orderBy: { name: "asc" },
  });

  return categories.map(toDto);
}

export async function getCategoryByIdService(id: string): Promise<CategoryDto> {
  const category = await prisma.category.findUnique({
    where: { id },
    include: categoryInclude,
  });
  if (!category) throw new Error("Category not found");
  return toDto(category);
}

export async function getCategoryBySlugService(
  slug: string,
): Promise<CategoryDto> {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: categoryInclude,
  });
  if (!category) throw new Error("Category not found");
  return toDto(category);
}

/* ----------------------------- mutations ---------------------------- */

export async function createCategoryService(
  input: CreateCategoryInput,
): Promise<CategoryDto> {
  return prisma.$transaction(async (tx) => {
    await assertSlugAvailable(tx, input.slug);
    await assertRelationsExist(tx, input);

    const attributeIds = [...new Set(input.attributeIds ?? [])];

    const created = await tx.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        parentId: input.parentId ?? null,
        image: input.image ?? null,
        sizeChartId: input.sizeChartId ?? null,
        categoryAttributes: {
          create: attributeIds.map((attributeId) => ({ attributeId })),
        },
      },
      include: categoryInclude,
    });

    return toDto(created);
  });
}

export async function updateCategoryService(
  id: string,
  input: UpdateCategoryInput,
): Promise<CategoryDto> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.category.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new Error("Category not found");

    if (input.slug !== undefined) await assertSlugAvailable(tx, input.slug, id);

    if (input.parentId) await assertNoCycle(tx, id, input.parentId);

    await assertRelationsExist(tx, input);

    // Full replace of attributes only when the client sent the field
    if (input.attributeIds !== undefined) {
      const attributeIds = [...new Set(input.attributeIds)];
      await tx.categoryAttribute.deleteMany({ where: { categoryId: id } });
      if (attributeIds.length > 0) {
        await tx.categoryAttribute.createMany({
          data: attributeIds.map((attributeId) => ({
            categoryId: id,
            attributeId,
          })),
        });
      }
    }

    const updated = await tx.category.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        parentId: input.parentId,
        image: input.image,
        sizeChartId: input.sizeChartId,
      },
      include: categoryInclude,
    });

    return toDto(updated);
  });
}

export async function deleteCategoryService(
  id: string,
): Promise<{ id: string }> {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true, children: true } } },
  });

  if (!category) throw new Error("Category not found");
  if (category._count.products > 0) {
    throw new Error("Cannot delete a category that still has products");
  }
  if (category._count.children > 0) {
    throw new Error("Cannot delete a category that has subcategories");
  }

  await prisma.category.delete({ where: { id } });
  return { id };
}
