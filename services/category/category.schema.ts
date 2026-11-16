import { z } from "zod";

const slugRegex = /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/;

const categoryFields = {
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(120)
    .regex(slugRegex, "Slug may only contain letters, numbers and hyphens"),
  parentId: z.string().min(1).nullable().optional(),
  image: z.string().trim().min(1).nullable().optional(),
  sizeChartId: z.string().min(1).nullable().optional(),
  // Full replace on save: the list sent is the final list of attributes.
  attributeIds: z.array(z.string().min(1)).optional(),
};

export const createCategorySchema = z.object(categoryFields);

export const updateCategorySchema = z
  .object(categoryFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const categoryQuerySchema = z.object({
  // "root" returns only top-level categories; an id returns that category's children
  parentId: z.string().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  // tree=true returns nested { children: [...] } starting from the roots
  tree: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
