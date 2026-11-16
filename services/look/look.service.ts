import { ZodError } from "zod";
import type { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors/errors";
import { getPublicUrl } from "../storage/storage.public-url";
import type {
  CreateLookInput,
  ReorderLooksInput,
  UpdateLookInput,
} from "./look.schema";
import type {
  AdminLookDto,
  AdminLookItemDto,
  LookDto,
  LookProductDto,
} from "./look.types";

export class LookNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`ست با شناسه ${id} یافت نشد`);
  }
}

/** Reported as a 400 VALIDATION_ERROR by withErrorHandling, tied to a form field. */
function fieldError(path: string, message: string) {
  return new ZodError([{ code: "custom", path: [path], message }]);
}

// A sale price only counts when it is really lower than the regular price
function validSale(price: number, sale: number | null): number | null {
  return sale != null && sale < price ? sale : null;
}

/* ------------------------------------------------------------------ */
/* Storefront                                                           */
/* ------------------------------------------------------------------ */

/**
 * A Look is live when it is published and "now" is inside its optional
 * startsAt / endsAt window (a missing bound means open-ended).
 */
export function activeLookWhere(now: Date = new Date()): Prisma.LookWhereInput {
  return {
    isPublished: true,
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    ],
  };
}

export async function getActiveLooksService(): Promise<LookDto[]> {
  const looks = await prisma.look.findMany({
    where: activeLookWhere(),
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      image: true,
      items: {
        where: { product: { isPublished: true } },
        orderBy: { sortOrder: "asc" },
        select: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              hoverImage: true,
              basePrice: true,
              salePrice: true,
            },
          },
        },
      },
    },
  });

  return looks
    .filter((look) => look.items.length > 0)
    .map((look): LookDto => {
      const items = look.items.map(({ product: p }): LookProductDto => {
        const salePrice = validSale(p.basePrice, p.salePrice);
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          imageUrl: getPublicUrl(p.coverImage),
          hoverImageUrl: getPublicUrl(p.hoverImage),
          basePrice: p.basePrice,
          salePrice,
          currentPrice: salePrice ?? p.basePrice,
          discountPercent:
            salePrice != null
              ? Math.round((1 - salePrice / p.basePrice) * 100)
              : null,
        };
      });

      const totalPrice = items.reduce((sum, i) => sum + i.currentPrice, 0);
      const originalTotal = items.reduce((sum, i) => sum + i.basePrice, 0);

      return {
        id: look.id,
        title: look.title,
        slug: look.slug,
        description: look.description,
        imageUrl: getPublicUrl(look.image),
        items,
        totalPrice,
        totalOriginalPrice: originalTotal > totalPrice ? originalTotal : null,
      };
    });
}

/* ------------------------------------------------------------------ */
/* Admin: mapping                                                       */
/* ------------------------------------------------------------------ */

const productSelect = {
  id: true,
  title: true,
  slug: true,
  coverImage: true,
  basePrice: true,
  salePrice: true,
  isPublished: true,
} satisfies Prisma.ProductSelect;

const adminLookSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  image: true,
  isPublished: true,
  sortOrder: true,
  startsAt: true,
  endsAt: true,
  createdAt: true,
  items: {
    orderBy: { sortOrder: "asc" },
    select: { product: { select: productSelect } },
  },
} satisfies Prisma.LookSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
type AdminLookRow = Prisma.LookGetPayload<{ select: typeof adminLookSelect }>;

function toItemDto(p: ProductRow): AdminLookItemDto {
  const salePrice = validSale(p.basePrice, p.salePrice);
  return {
    productId: p.id,
    title: p.title,
    slug: p.slug,
    coverImageUrl: getPublicUrl(p.coverImage),
    basePrice: p.basePrice,
    salePrice,
    currentPrice: salePrice ?? p.basePrice,
    isPublished: p.isPublished,
  };
}

function toAdminLookDto(row: AdminLookRow): AdminLookDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    image: row.image,
    imageUrl: getPublicUrl(row.image),
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    items: row.items.map((i) => toItemDto(i.product)),
    createdAt: row.createdAt.toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Admin: validation helpers                                            */
/* ------------------------------------------------------------------ */

function assertDateRange(startsAt: Date | null, endsAt: Date | null) {
  if (startsAt && endsAt && endsAt <= startsAt) {
    throw fieldError("endsAt", "تاریخ پایان باید بعد از تاریخ شروع باشد");
  }
}

function assertPublishable(isPublished: boolean, itemCount: number) {
  if (isPublished && itemCount === 0) {
    throw fieldError("productIds", "برای انتشار، حداقل یک محصول به ست اضافه کنید");
  }
}

async function assertProductsExist(ids: string[]) {
  if (ids.length === 0) return;
  const found = await prisma.product.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    throw fieldError("productIds", "برخی از محصولات انتخاب‌شده یافت نشدند");
  }
}

/** Keeps latin letters, digits and persian letters; spaces become dashes. */
function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const slugTaken = (slug: string, excludeId?: string) =>
  prisma.look.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });

/** An explicit slug must be free; an automatic one gets -2, -3... until it is. */
async function resolveSlug(
  input: { slug?: string | null; title: string },
  excludeId?: string,
) {
  if (input.slug) {
    const clean = slugify(input.slug);
    if (!clean) throw fieldError("slug", "نشانی معتبر نیست");
    if (await slugTaken(clean, excludeId)) {
      throw fieldError("slug", "این نشانی قبلاً استفاده شده است");
    }
    return clean;
  }

  const root = slugify(input.title) || "look";
  let candidate = root;
  for (let n = 2; await slugTaken(candidate, excludeId); n++) {
    candidate = `${root}-${n}`;
  }
  return candidate;
}

/* ------------------------------------------------------------------ */
/* Admin: queries and commands                                          */
/* ------------------------------------------------------------------ */

export async function listLooksForAdmin(): Promise<AdminLookDto[]> {
  const rows = await prisma.look.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: adminLookSelect,
  });
  return rows.map(toAdminLookDto);
}

export async function getLookByIdForAdmin(id: string): Promise<AdminLookDto> {
  const row = await prisma.look.findUnique({
    where: { id },
    select: adminLookSelect,
  });
  if (!row) throw new LookNotFoundError(id);
  return toAdminLookDto(row);
}

export async function createLook(input: CreateLookInput): Promise<AdminLookDto> {
  assertDateRange(input.startsAt ?? null, input.endsAt ?? null);
  assertPublishable(input.isPublished, input.productIds.length);
  await assertProductsExist(input.productIds);
  const slug = await resolveSlug(input);

  const created = await prisma.look.create({
    data: {
      title: input.title,
      slug,
      description: input.description ?? null,
      image: input.image,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      items: {
        create: input.productIds.map((productId, i) => ({
          productId,
          sortOrder: i,
        })),
      },
    },
    select: adminLookSelect,
  });
  return toAdminLookDto(created);
}

export async function updateLook(
  id: string,
  input: UpdateLookInput,
): Promise<AdminLookDto> {
  const existing = await prisma.look.findUnique({
    where: { id },
    select: {
      title: true,
      isPublished: true,
      startsAt: true,
      endsAt: true,
      _count: { select: { items: true } },
    },
  });
  if (!existing) throw new LookNotFoundError(id);

  assertPublishable(
    input.isPublished ?? existing.isPublished,
    input.productIds ? input.productIds.length : existing._count.items,
  );
  assertDateRange(
    input.startsAt !== undefined ? input.startsAt : existing.startsAt,
    input.endsAt !== undefined ? input.endsAt : existing.endsAt,
  );
  if (input.productIds) await assertProductsExist(input.productIds);

  // undefined = leave as is, null/"" = regenerate from the title
  const slug =
    input.slug !== undefined
      ? await resolveSlug(
          { slug: input.slug, title: input.title ?? existing.title },
          id,
        )
      : undefined;

  const data: Prisma.LookUpdateInput = {
    title: input.title,
    slug,
    description: input.description,
    image: input.image,
    isPublished: input.isPublished,
    sortOrder: input.sortOrder,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  };

  const updated = await prisma.$transaction(async (tx) => {
    if (input.productIds) {
      // The array order is the display order, so replace the whole set
      await tx.lookItem.deleteMany({ where: { lookId: id } });
      await tx.lookItem.createMany({
        data: input.productIds.map((productId, i) => ({
          lookId: id,
          productId,
          sortOrder: i,
        })),
      });
    }
    return tx.look.update({ where: { id }, data, select: adminLookSelect });
  });
  return toAdminLookDto(updated);
}

export async function deleteLook(id: string) {
  const existing = await prisma.look.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new LookNotFoundError(id);
  // LookItem rows go with it (onDelete: Cascade)
  await prisma.look.delete({ where: { id } });
}

export async function reorderLooks({ items }: ReorderLooksInput) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.look.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );
}

/** Product picker in the look form: any product, newest first, max 20. */
export async function searchProductsForLookPicker(
  search?: string,
): Promise<AdminLookItemDto[]> {
  const q = search?.trim();
  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 20,
    select: productSelect,
  });
  return products.map(toItemDto);
}
