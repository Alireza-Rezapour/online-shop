import { z } from "zod";

export const createColorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  hex: z
    .string()
    .trim()
    .regex(/^#?[0-9a-fA-F]{6}$/, "Hex must be a 6-digit color like #1A2B3C")
    .transform((v) => `#${v.replace("#", "").toUpperCase()}`),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{2,10}$/, "Code must be 2-10 letters or digits"),
});

export const updateColorSchema = createColorSchema;

export type CreateColorInput = z.infer<typeof createColorSchema>;
export type UpdateColorInput = z.infer<typeof updateColorSchema>;
