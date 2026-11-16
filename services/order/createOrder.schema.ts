import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1, "The cart is empty")
    .max(50),
  shippingReceiverName: z.string().trim().min(1).max(100),
  shippingPhone: z.string().trim().min(5).max(20),
  shippingProvince: z.string().trim().min(1).max(100),
  shippingCity: z.string().trim().min(1).max(100),
  shippingAddress: z.string().trim().min(1).max(500),
  shippingPostalCode: z.string().trim().min(1).max(20),
  shippingCarrierId: z.string().min(1),
  couponCode: z.string().trim().max(50).optional(),
});

// Admins may only fix the delivery details of an order, never prices or status
export const updateOrderShippingSchema = createOrderSchema
  .pick({
    shippingReceiverName: true,
    shippingPhone: true,
    shippingProvince: true,
    shippingCity: true,
    shippingAddress: true,
    shippingPostalCode: true,
  })
  .partial()
  .strict();
