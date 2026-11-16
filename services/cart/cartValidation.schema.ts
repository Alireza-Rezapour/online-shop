import { z } from "zod";

export const cartValidationSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .max(50),
  couponCode: z.string().trim().max(50).optional(),
});

export type CartValidationRequest = z.input<typeof cartValidationSchema>;
