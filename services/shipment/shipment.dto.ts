import type { Prisma, Shipment } from "@/lib/generated/prisma/client";
import type { ShipmentStatus } from "@/lib/generated/prisma/enums";
import type { z } from "zod";
import type {
  createShipmentSchema,
  updateShipmentSchema,
} from "./shipment.schema";
import { Serialized } from "../serialized";

export const shipmentWithCarrierInclude = {
  carrier: true,
} satisfies Prisma.ShipmentInclude;
export const shipmentAdminInclude = {
  order: true,
  carrier: true,
} satisfies Prisma.ShipmentInclude;

// The plain row: returned by create, update and status change
export type ShipmentDto = Serialized<Shipment>;
export type ShipmentWithCarrierDto = Serialized<
  Prisma.ShipmentGetPayload<{ include: typeof shipmentWithCarrierInclude }>
>;
export type ShipmentWithOrderDto = Serialized<
  Prisma.ShipmentGetPayload<{ include: typeof shipmentAdminInclude }>
>;

export type CreateShipmentRequest = z.input<typeof createShipmentSchema>;
export type UpdateShipmentRequest = z.input<typeof updateShipmentSchema>;
export type GetShipmentsParams = { status?: ShipmentStatus };
