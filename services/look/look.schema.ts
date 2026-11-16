import { z } from "zod";
import { MAX_LOOK_ITEMS } from "./look.types";

/** Optional text: "" becomes null, undefined stays undefined (= unchanged on update). */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `حداکثر ${max} کاراکتر مجاز است`)
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? v : null));

/** Ordered product ids: the array order becomes LookItem.sortOrder. */
const productIds = z
  .array(z.string().trim().min(1))
  .max(MAX_LOOK_ITEMS, `حداکثر ${MAX_LOOK_ITEMS} محصول در هر ست مجاز است`)
  .refine((ids) => new Set(ids).size === ids.length, "محصول تکراری است");

const fields = {
  slug: optionalText(120),
  description: optionalText(1000),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
};

const title = z.string().trim().min(1, "عنوان باید وارد شود").max(120);
const image = z.string().trim().min(1, "تصویر باید مشخص شود").max(500);

// No defaults on update, otherwise a partial update would reset fields.
export const createLookSchema = z.object({
  ...fields,
  title,
  image,
  productIds: productIds.default([]),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateLookSchema = z.object({
  ...fields,
  title: title.optional(),
  image: image.optional(),
  productIds: productIds.optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const reorderLooksSchema = z.object({
  items: z
    .array(z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0) }))
    .min(1),
});

export type CreateLookInput = z.infer<typeof createLookSchema>;
export type UpdateLookInput = z.infer<typeof updateLookSchema>;
export type ReorderLooksInput = z.infer<typeof reorderLooksSchema>;

// Request-body shapes for the client
export type CreateLookBody = z.input<typeof createLookSchema>;
export type UpdateLookBody = z.input<typeof updateLookSchema>;
