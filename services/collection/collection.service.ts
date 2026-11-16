import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./collection.schema";
import { NotFoundError } from "@/lib/errors/errors";
import { getPublicUrl } from "../storage/storage.public-url";

export class CollectionNotFoundError extends NotFoundError {
  constructor(idOrSlug: string) {
    super(`کالکشن «${idOrSlug}» یافت نشد`);
  }
}

/* -------------------------------- types ------------------------------- */

export type CollectionDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
};

export type AdminCollectionDto = CollectionDto & { productCount: number };
// Storefront: productCount only counts published products
export type StoreCollectionDto = AdminCollectionDto;

export type CollectionProductDto = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  isPublished: boolean;
};

/* ------------------------------- helpers ------------------------------ */

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toDto(c: CollectionRow): CollectionDto {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    isActive: c.isActive,
    startsAt: c.startsAt?.toISOString() ?? null,
    endsAt: c.endsAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    imageUrl: getPublicUrl(c.image),
  };
}

// A ZodError is something every route handler already turns into a 400
function invalid(path: string, message: string) {
  return new ZodError([{ code: "custom", path: [path], message } as never]);
}

/** A collection is live when it is switched on and today is inside its date window. */
export function activeCollectionWhere(
  now = new Date(),
): Prisma.CollectionWhereInput {
  return {
    isActive: true,
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    ],
  };
}

/* ------------------------------- storefront --------------------------- */

export async function listCollections(): Promise<StoreCollectionDto[]> {
  const visible = { product: { isPublished: true } };

  const rows = await prisma.collection.findMany({
    where: { ...activeCollectionWhere(), products: { some: visible } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: { where: visible } } } },
  });

  return rows.map((c) => ({ ...toDto(c), productCount: c._count.products }));
}

// Only the collection itself: its products come from GET /api/products?collection=slug
export async function getCollectionBySlug(
  slug: string,
): Promise<CollectionDto> {
  const collection = await prisma.collection.findFirst({
    where: { slug, ...activeCollectionWhere() },
  });
  if (!collection) throw new CollectionNotFoundError(slug);
  return toDto(collection);
}

/* --------------------------------- admin ------------------------------ */

export async function listAllCollections(): Promise<AdminCollectionDto[]> {
  const rows = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return rows.map((c) => ({ ...toDto(c), productCount: c._count.products }));
}

export async function createCollection(input: CreateCollectionInput) {
  return toDto(await prisma.collection.create({ data: input }));
}

export async function updateCollection(
  id: string,
  input: UpdateCollectionInput,
) {
  const existing = await prisma.collection.findUnique({ where: { id } });
  if (!existing) throw new CollectionNotFoundError(id);

  // A partial update can send only one of the two dates: compare against the stored one
  const startsAt =
    input.startsAt !== undefined ? input.startsAt : existing.startsAt;
  const endsAt = input.endsAt !== undefined ? input.endsAt : existing.endsAt;
  if (startsAt && endsAt && endsAt < startsAt) {
    throw invalid("endsAt", "تاریخ پایان باید بعد از تاریخ شروع باشد");
  }

  return toDto(await prisma.collection.update({ where: { id }, data: input }));
}

export async function deleteCollection(id: string) {
  const existing = await prisma.collection.findUnique({ where: { id } });
  if (!existing) throw new CollectionNotFoundError(id);
  // The links to products go with it (cascade); the products themselves stay
  await prisma.collection.delete({ where: { id } });
}

export async function getCollectionProducts(
  id: string,
): Promise<CollectionProductDto[]> {
  const existing = await prisma.collection.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new CollectionNotFoundError(id);

  const rows = await prisma.productCollection.findMany({
    where: { collectionId: id },
    orderBy: { product: { title: "asc" } },
    select: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          isPublished: true,
        },
      },
    },
  });

  return rows.map((row) => row.product);
}

/** Makes the products of a collection exactly `productIds`. */
export async function setCollectionProducts(id: string, productIds: string[]) {
  const unique = [...new Set(productIds)];

  return prisma.$transaction(async (tx) => {
    const existing = await tx.collection.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new CollectionNotFoundError(id);

    if (unique.length > 0) {
      const count = await tx.product.count({ where: { id: { in: unique } } });
      if (count !== unique.length) {
        throw invalid("productIds", "یک یا چند محصول یافت نشد");
      }
    }

    await tx.productCollection.deleteMany({
      where: { collectionId: id, productId: { notIn: unique } },
    });

    if (unique.length > 0) {
      await tx.productCollection.createMany({
        data: unique.map((productId) => ({ productId, collectionId: id })),
        skipDuplicates: true,
      });
    }

    return { productCount: unique.length };
  });
}
