import { z } from "zod";

export const createShipmentSchema = z.object({
  carrierId: z.string().min(1, "carrierId is required"),
  trackingCode: z.string().trim().max(100).optional(),
});

export const updateShipmentSchema = z.object({
  carrierId: z.string().min(1).optional(),
  trackingCode: z.string().trim().max(100).optional(),
});
