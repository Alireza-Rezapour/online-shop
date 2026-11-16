import { z } from "zod";

const sizeName = z.string().trim().min(1, "Size name is required").max(30);

export const sizeInputSchema = z.object({
  // Present for existing sizes, missing for new ones
  id: z.string().min(1).optional(),
  name: sizeName,
});

const sizesField = z
  .array(sizeInputSchema)
  .min(1, "At least one size is required")
  .max(50)
  .refine(
    (sizes) => {
      const names = sizes.map((s) => s.name.toLowerCase());
      return new Set(names).size === names.length;
    },
    { message: "Size names must be unique within a chart" },
  );

export const createSizeChartSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  sizes: sizesField,
});

// PUT is a full replace: the array order is the final order,
// sizes missing from the array are removed, sizes without an id are created.
export const updateSizeChartSchema = createSizeChartSchema;

export type SizeInput = z.infer<typeof sizeInputSchema>;
export type CreateSizeChartInput = z.infer<typeof createSizeChartSchema>;
export type UpdateSizeChartInput = z.infer<typeof updateSizeChartSchema>;
