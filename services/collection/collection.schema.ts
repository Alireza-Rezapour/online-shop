import { z } from "zod";

// Same rule as categories and products: lowercase latin, digits, Persian letters, hyphens
const slugRegex = /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/;

const baseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام کالکشن باید حداقل ۲ کاراکتر باشد")
    .max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(120)
    .regex(slugRegex, "اسلاگ فقط می‌تواند شامل حروف، عدد و خط تیره باشد"),
  description: z.string().trim().max(1000).nullable().optional(),
  image: z.string().trim().min(1).nullable().optional(),
  isActive: z.boolean(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});

const datesInOrder = (d: { startsAt?: Date | null; endsAt?: Date | null }) =>
  !d.startsAt || !d.endsAt || d.endsAt >= d.startsAt;

const datesError = {
  message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
  path: ["endsAt"],
};

// The default lives here only, so a partial update never switches a collection back on
export const createCollectionSchema = baseSchema
  .extend({ isActive: z.boolean().default(true) })
  .refine(datesInOrder, datesError);

export const updateCollectionSchema = baseSchema
  .partial()
  .refine(datesInOrder, datesError);

export const collectionProductsSchema = z.object({
  productIds: z.array(z.string().min(1)).max(500),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
