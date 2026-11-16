import { z } from "zod";

const slugRegex = /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/;
const price = z.number().int().min(1).max(1_000_000_000);

export const productBasicSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Slug is required")
      .max(200)
      .regex(slugRegex, "Slug may only contain letters, numbers and hyphens"),
    description: z.string().trim().max(10000).nullable().optional(),
    categoryId: z.string().min(1, "Category is required"),
    basePrice: price,
    salePrice: price.nullable().optional(),
  })
  .refine((d) => d.salePrice == null || d.salePrice < d.basePrice, {
    message: "Sale price must be lower than the base price",
    path: ["salePrice"],
  });

export const productAttributesSchema = z
  .object({
    attributes: z
      .array(
        z.object({
          attributeId: z.string().min(1),
          attributeValueId: z.string().min(1),
        }),
      )
      .max(100),
  })
  .refine(
    (d) =>
      new Set(d.attributes.map((a) => a.attributeId)).size ===
      d.attributes.length,
    { message: "A product can have only one value per attribute" },
  );

const variantInput = z.object({
  // Present for existing variants, missing for new ones
  id: z.string().min(1).optional(),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .min(1)
    .max(64)
    .regex(/^[A-Z0-9][A-Z0-9_-]*$/, "SKU may only contain A-Z, 0-9, - and _"),
  // null = use the product price
  price: price.nullable().optional(),
  salePrice: price.nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000),
});

export const productVariantsSchema = z
  .object({ variants: z.array(variantInput).max(300) })
  .superRefine((data, ctx) => {
    const combos = new Set<string>();
    const skus = new Set<string>();
    data.variants.forEach((v, index) => {
      const combo = `${v.colorId}:${v.sizeId}`;
      if (combos.has(combo)) {
        ctx.addIssue({
          code: "custom",
          path: ["variants", index],
          message: "Duplicate color and size combination",
        });
      }
      if (skus.has(v.sku)) {
        ctx.addIssue({
          code: "custom",
          path: ["variants", index, "sku"],
          message: "Duplicate SKU",
        });
      }
      combos.add(combo);
      skus.add(v.sku);
    });
  });

export const productImagesSchema = z.object({
  coverImage: z.string().trim().min(1).nullable(),
  hoverImage: z.string().trim().min(1).nullable(),
  images: z
    .array(
      z.object({
        url: z.string().trim().min(1),
        alt: z.string().trim().max(200).optional(),
      }),
    )
    .max(20),
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((v) => [10, 20, 50].includes(v), "Invalid page size")
    .default(20),
  search: z.string().trim().min(1).optional(),
  // Includes the products of all its subcategories
  categoryId: z.string().min(1).optional(),
  status: z.enum(["all", "published", "draft"]).default("all"),
  sort: z
    .enum(["newest", "oldest", "price-asc", "price-desc", "title", "relevance"])
    .default("newest"),
  collection: z.string().optional(),
});

export const storeProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(12),
  // Category slug; includes the products of its subcategories
  category: z.string().min(1).optional(),
  collection: z.string().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  // Comma-separated color codes: ?colors=BLK,WHT
  colors: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((c) => c.trim().toUpperCase())
            .filter(Boolean)
        : [],
    ),
  sizes: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    ),
  sort: z
    .enum(["newest", "price-asc", "price-desc", "title", "relevance"])
    .default("newest"),
  favorites: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export type StoreProductListQuery = z.output<
  typeof storeProductListQuerySchema
>;

// What the frontend passes to the RTK Query hook
export type StoreProductListParams = {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  colors?: string[];
  sizes?: string[];
  sort?: "newest" | "price-asc" | "price-desc" | "title" | "relevance";
  favorites?: boolean;
  collection?: string;
};

export type ProductListQuery = z.output<typeof productListQuerySchema>;
export type ProductListParams = z.input<typeof productListQuerySchema>;

export const productPublishSchema = z.object({ isPublished: z.boolean() });

export type ProductBasicInput = z.infer<typeof productBasicSchema>;
export type ProductAttributesInput = z.infer<typeof productAttributesSchema>;
export type ProductVariantsInput = z.infer<typeof productVariantsSchema>;
export type ProductImagesInput = z.infer<typeof productImagesSchema>;
