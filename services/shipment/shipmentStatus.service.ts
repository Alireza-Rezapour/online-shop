import { ShipmentStatus } from "@/lib/generated/prisma/enums";

export const SHIPMENT_STATUS_TRANSITIONS: Record<
  ShipmentStatus,
  ShipmentStatus[]
> = {
  PENDING: ["PACKING", "SHIPPED"],
  PACKING: ["SHIPPED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  RETURNED: [],
};

export function assertValidShipmentStatusTransition(
  current: ShipmentStatus,
  next: ShipmentStatus,
) {
  if (current === next) {
    throw new Error(`Shipment is already ${current}.`);
  }
  if (!SHIPMENT_STATUS_TRANSITIONS[current].includes(next)) {
    throw new Error(
      `Cannot change shipment status from ${current} to ${next}.`,
    );
  }
}
