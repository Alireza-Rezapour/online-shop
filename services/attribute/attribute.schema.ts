import { z } from "zod";

export const attributeValueInputSchema = z.object({
  // Present for existing values, missing for new ones
  id: z.string().min(1).optional(),
  value: z.string().trim().min(1, "Value is required").max(100),
});

export const createAttributeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  values: z
    .array(attributeValueInputSchema)
    .min(1, "At least one value is required")
    .max(100)
    .refine(
      (values) => {
        const keys = values.map((v) => v.value.toLowerCase());
        return new Set(keys).size === keys.length;
      },
      { message: "Values must be unique within an attribute" },
    ),
});

// PUT is a full replace: values missing from the array are removed,
// values without an id are created, values with an id are renamed.
export const updateAttributeSchema = createAttributeSchema;

export type AttributeValueInput = z.infer<typeof attributeValueInputSchema>;
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
