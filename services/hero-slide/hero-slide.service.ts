import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import type {
  CreateHeroSlideInput,
  HeroCtaOptionsQuery,
  ReorderHeroSlidesInput,
  UpdateHeroSlideInput,
} from "./hero-slide.schema";
import { NotFoundError } from "@/lib/errors/errors";

export class HeroSlideNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`اسلاید با شناسه ${id} یافت نشد`);
  }
}

type CtaType = "PRODUCT" | "COLLECTION" | "CATEGORY";
type CtaRow = { id: string; label: string; slug: string };

/** Reported as a 400 VALIDATION_ERROR by withErrorHandling, tied to a form field. */
function fieldError(path: string, message: string) {
  return new ZodError([{ code: "custom", path: [path], message }]);
}

/* ------------------------------------------------------------------ */
/* CTA helpers                                                          */
/* ------------------------------------------------------------------ */

/** Looks up the slug of the thing the admin picked. Used when saving. */
async function resolveCtaSlug(type: CtaType, id: string): Promise<string> {
  const row =
    type === "PRODUCT"
      ? await prisma.product.findUnique({
          where: { id },
          select: { slug: true },
        })
      : type === "COLLECTION"
        ? await prisma.collection.findUnique({
            where: { id },
            select: { slug: true },
          })
        : await prisma.category.findUnique({
            where: { id },
            select: { slug: true },
          });

  if (!row) {
    throw fieldError("ctaTargetId", "مقصد انتخاب‌شده برای دکمه یافت نشد");
  }
  return row.slug;
}

/**
 * Validates the three CTA fields together and returns the values to store.
 * A slide either has no button at all, or label + type + target.
 */
async function buildCta(state: {
  ctaLabel: string | null;
  ctaType: CtaType | null;
  ctaTargetId: string | null;
}) {
  const { ctaLabel, ctaType, ctaTargetId } = state;

  if (!ctaType && !ctaTargetId) {
    if (ctaLabel) {
      throw fieldError("ctaType", "برای دکمه باید مقصد را انتخاب کنید");
    }
    return { ctaLabel: null, ctaType: null, ctaTargetId: null, ctaSlug: null };
  }

  if (!ctaType) throw fieldError("ctaType", "نوع مقصد دکمه را انتخاب کنید");
  if (!ctaTargetId) throw fieldError("ctaTargetId", "مقصد دکمه را انتخاب کنید");
  if (!ctaLabel) throw fieldError("ctaLabel", "متن دکمه باید وارد شود");

  return {
    ctaLabel,
    ctaType,
    ctaTargetId,
    ctaSlug: await resolveCtaSlug(ctaType, ctaTargetId),
  };
}

function assertDateRange(startsAt: Date | null, endsAt: Date | null) {
  if (startsAt && endsAt && endsAt <= startsAt) {
    throw fieldError("endsAt", "تاریخ پایان باید بعد از تاریخ شروع باشد");
  }
}

type WithCta = {
  ctaType: CtaType | null;
  ctaTargetId: string | null;
};

/**
 * Loads id -> { label, slug } for every product / collection / category the
 * given slides point at, in at most three queries.
 * publishedOnly = true is for the storefront (hide unpublished targets).
 */
async function loadCtaRows(slides: WithCta[], publishedOnly: boolean) {
  const ids: Record<CtaType, Set<string>> = {
    PRODUCT: new Set(),
    COLLECTION: new Set(),
    CATEGORY: new Set(),
  };
  for (const s of slides) {
    if (s.ctaType && s.ctaTargetId) ids[s.ctaType].add(s.ctaTargetId);
  }

  const [products, collections, categories] = await Promise.all([
    ids.PRODUCT.size
      ? prisma.product.findMany({
          where: {
            id: { in: [...ids.PRODUCT] },
            ...(publishedOnly && { isPublished: true }),
          },
          select: { id: true, title: true, slug: true },
        })
      : [],
    ids.COLLECTION.size
      ? prisma.collection.findMany({
          where: {
            id: { in: [...ids.COLLECTION] },
            ...(publishedOnly && { isActive: true }),
          },
          select: { id: true, name: true, slug: true },
        })
      : [],
    ids.CATEGORY.size
      ? prisma.category.findMany({
          where: { id: { in: [...ids.CATEGORY] } },
          select: { id: true, name: true, slug: true },
        })
      : [],
  ]);

  const rows: Record<CtaType, Map<string, CtaRow>> = {
    PRODUCT: new Map(
      products.map((r) => [r.id, { id: r.id, label: r.title, slug: r.slug }]),
    ),
    COLLECTION: new Map(
      collections.map((r) => [r.id, { id: r.id, label: r.name, slug: r.slug }]),
    ),
    CATEGORY: new Map(
      categories.map((r) => [r.id, { id: r.id, label: r.name, slug: r.slug }]),
    ),
  };
  return rows;
}

/**
 * The stored ctaSlug is only a snapshot: a product can be renamed or
 * unpublished after the slide was saved. For the storefront we look the
 * slugs up again, and a slide whose target is gone simply loses its button
 * instead of linking to a 404.
 */
async function withFreshCtaSlugs<
  T extends WithCta & { ctaSlug: string | null },
>(slides: T[]): Promise<T[]> {
  const rows = await loadCtaRows(slides, true);
  return slides.map((s) => ({
    ...s,
    ctaSlug:
      s.ctaType && s.ctaTargetId
        ? (rows[s.ctaType].get(s.ctaTargetId)?.slug ?? null)
        : null,
  }));
}

/** Admin: adds the picked target's name so the table can show it. */
async function attachCtaTargets<T extends WithCta>(
  slides: T[],
): Promise<(T & { ctaTarget: CtaRow | null })[]> {
  const rows = await loadCtaRows(slides, false);
  return slides.map((s) => ({
    ...s,
    ctaTarget:
      s.ctaType && s.ctaTargetId
        ? (rows[s.ctaType].get(s.ctaTargetId) ?? null)
        : null,
  }));
}

/* ------------------------------------------------------------------ */
/* Storefront                                                           */
/* ------------------------------------------------------------------ */

export async function listActiveHeroSlidesForStorefront() {
  const now = new Date();
  const slides = await prisma.heroSlide.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });
  return withFreshCtaSlugs(slides);
}

/* ------------------------------------------------------------------ */
/* Admin                                                                */
/* ------------------------------------------------------------------ */

export async function listHeroSlidesForAdmin() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return attachCtaTargets(slides);
}

export async function getHeroSlideByIdForAdmin(id: string) {
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) throw new HeroSlideNotFoundError(id);
  const [withTarget] = await attachCtaTargets([slide]);
  return withTarget;
}

export async function createHeroSlide(input: CreateHeroSlideInput) {
  const cta = await buildCta({
    ctaLabel: input.ctaLabel ?? null,
    ctaType: input.ctaType ?? null,
    ctaTargetId: input.ctaTargetId ?? null,
  });
  assertDateRange(input.startsAt ?? null, input.endsAt ?? null);

  return prisma.heroSlide.create({ data: { ...input, ...cta } });
}

export async function updateHeroSlide(id: string, input: UpdateHeroSlideInput) {
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw new HeroSlideNotFoundError(id);

  // Re-validate the button only when the request touches it, merging the
  // untouched fields from the stored slide.
  const touchesCta =
    input.ctaLabel !== undefined ||
    input.ctaType !== undefined ||
    input.ctaTargetId !== undefined;

  const cta = touchesCta
    ? await buildCta({
        ctaLabel:
          input.ctaLabel !== undefined ? input.ctaLabel : existing.ctaLabel,
        ctaType: input.ctaType !== undefined ? input.ctaType : existing.ctaType,
        ctaTargetId:
          input.ctaTargetId !== undefined
            ? input.ctaTargetId
            : existing.ctaTargetId,
      })
    : {};

  assertDateRange(
    input.startsAt !== undefined ? input.startsAt : existing.startsAt,
    input.endsAt !== undefined ? input.endsAt : existing.endsAt,
  );

  return prisma.heroSlide.update({
    where: { id },
    data: { ...input, ...cta },
  });
}

export async function deleteHeroSlide(id: string) {
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw new HeroSlideNotFoundError(id);
  await prisma.heroSlide.delete({ where: { id } });
}

/** Drag-and-drop reorder: one transaction, an unknown id rolls everything back (404). */
export async function reorderHeroSlides({ items }: ReorderHeroSlidesInput) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.heroSlide.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );
}

/** Options for the button-target picker in the admin form. */
export async function listHeroCtaOptions({
  type,
  search,
}: HeroCtaOptionsQuery): Promise<CtaRow[]> {
  const q = search?.trim();
  const take = 20;

  if (type === "PRODUCT") {
    const rows = await prisma.product.findMany({
      where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { title: "asc" },
      take,
      select: { id: true, title: true, slug: true },
    });
    return rows.map((r) => ({ id: r.id, label: r.title, slug: r.slug }));
  }

  if (type === "COLLECTION") {
    const rows = await prisma.collection.findMany({
      where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { name: "asc" },
      take,
      select: { id: true, name: true, slug: true },
    });
    return rows.map((r) => ({ id: r.id, label: r.name, slug: r.slug }));
  }

  const rows = await prisma.category.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
    take,
    select: { id: true, name: true, slug: true },
  });
  return rows.map((r) => ({ id: r.id, label: r.name, slug: r.slug }));
}
