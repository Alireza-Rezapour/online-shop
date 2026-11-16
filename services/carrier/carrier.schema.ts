import { z } from "zod";

export const createCarrierSchema = z.object({
  name: z.string().trim().min(1, "نام شرکت حمل و نقل الزامی است").max(100),
  cost: z.number().int().min(0, "هزینه نمی‌تواند منفی باشد"),
});

export const updateCarrierSchema = createCarrierSchema.partial();

export type CreateCarrierInput = z.infer<typeof createCarrierSchema>;
export type UpdateCarrierInput = z.infer<typeof updateCarrierSchema>;
