import { z } from "zod";

export const heroPositionEnum = z.enum([
  "TOP_LEFT",
  "TOP_CENTER",
  "TOP_RIGHT",
  "CENTER_LEFT",
  "CENTER",
  "CENTER_RIGHT",
  "BOTTOM_LEFT",
  "BOTTOM_CENTER",
  "BOTTOM_RIGHT",
]);
export const heroCtaTypeEnum = z.enum(["PRODUCT", "COLLECTION", "CATEGORY"]);
export const heroTextToneEnum = z.enum(["LIGHT", "DARK"]);

/** Optional text: "" becomes null, undefined stays undefined (= unchanged on update). */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `حداکثر ${max} کاراکتر مجاز است`)
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? v : null));

const percent = z.number().int().min(0).max(100);

// Fields shared by create and update. No defaults here, otherwise a partial
// update would silently reset fields back to their defaults.
const fields = {
  eyebrow: optionalText(80),
  description: optionalText(1000),
  mobileImage: optionalText(500),
  imageAlt: optionalText(200),

  ctaLabel: optionalText(50),
  ctaType: heroCtaTypeEnum.nullable().optional(),
  ctaTargetId: optionalText(100),

  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
};

const baseTitle = z.string().trim().min(1, "عنوان باید وارد شود").max(200);
const baseImage = z.string().trim().min(1, "تصویر باید مشخص شود").max(500);

export const createHeroSlideSchema = z.object({
  ...fields,
  title: baseTitle,
  image: baseImage,
  focalX: percent.default(50),
  focalY: percent.default(50),
  desktopPosition: heroPositionEnum.default("CENTER_LEFT"),
  mobilePosition: heroPositionEnum.default("CENTER"),
  textTone: heroTextToneEnum.default("LIGHT"),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateHeroSlideSchema = z.object({
  ...fields,
  title: baseTitle.optional(),
  image: baseImage.optional(),
  focalX: percent.optional(),
  focalY: percent.optional(),
  desktopPosition: heroPositionEnum.optional(),
  mobilePosition: heroPositionEnum.optional(),
  textTone: heroTextToneEnum.optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Parsed (server) shapes
export type CreateHeroSlideInput = z.infer<typeof createHeroSlideSchema>;
export type UpdateHeroSlideInput = z.infer<typeof updateHeroSlideSchema>;

// Request-body shapes for the client (defaults are optional there)
export type CreateHeroSlideBody = z.input<typeof createHeroSlideSchema>;
export type UpdateHeroSlideBody = z.input<typeof updateHeroSlideSchema>;

/* ------------------------------------------------------------------ */
/* Admin helpers                                                        */
/* ------------------------------------------------------------------ */

export const reorderHeroSlidesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(100),
});

export const heroCtaOptionsQuerySchema = z.object({
  type: heroCtaTypeEnum,
  search: z.string().trim().max(100).optional(),
});

export type ReorderHeroSlidesInput = z.infer<typeof reorderHeroSlidesSchema>;
export type HeroCtaOptionsQuery = z.infer<typeof heroCtaOptionsQuerySchema>;
