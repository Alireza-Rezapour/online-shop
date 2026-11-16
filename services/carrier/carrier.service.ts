import prisma from "@/lib/prisma";
import type { CreateCarrierInput, UpdateCarrierInput } from "./carrier.schema";
import { NotFoundError } from "@/lib/errors/errors";

export class CarrierNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`شرکت حمل و نقل با شناسه ${id} یافت نشد`);
  }
}

export async function listCarriers() {
  return prisma.carrier.findMany({ orderBy: { cost: "asc" } });
}

export async function createCarrier(input: CreateCarrierInput) {
  return prisma.carrier.create({ data: input });
}

export async function updateCarrier(id: string, input: UpdateCarrierInput) {
  const existing = await prisma.carrier.findUnique({ where: { id } });
  if (!existing) throw new CarrierNotFoundError(id);
  return prisma.carrier.update({ where: { id }, data: input });
}

export async function deleteCarrier(id: string) {
  const existing = await prisma.carrier.findUnique({ where: { id } });
  if (!existing) throw new CarrierNotFoundError(id);
  // Shipment.carrierId is onDelete: Restrict — a carrier used by any past
  // shipment fails to delete via the shared FK_CONSTRAINT 409, not silently.
  await prisma.carrier.delete({ where: { id } });
}
