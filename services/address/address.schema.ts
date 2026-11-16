import { z } from "zod";

export const createAddressSchema = z.object({
  receiverName: z
    .string()
    .trim()
    .min(2, "نام گیرنده باید حداقل ۲ کاراکتر باشد")
    .max(100),
  phone: z.string().trim().min(8, "شماره تماس نامعتبر است").max(20),
  province: z.string().trim().min(1, "استان باید انتخاب شود"),
  city: z.string().trim().min(1, "شهر باید انتخاب شود"),
  details: z.string().trim().min(3, "جزییات آدرس باید وارد شود").max(500),
  postalCode: z.string().trim().min(3, "کد پستی نامعتبر است").max(20),
  label: z.string().trim().max(50).nullable().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
