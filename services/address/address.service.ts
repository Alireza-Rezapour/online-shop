import prisma from "@/lib/prisma";
import type { CreateAddressInput, UpdateAddressInput } from "./address.schema";
import { Prisma } from "@/lib/generated/prisma/client";
import { ForbiddenError, NotFoundError } from "@/lib/errors/errors";

export class AddressNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`آدرس با شناسه ${id} یافت نشد`);
  }
}
export class AddressForbiddenError extends ForbiddenError {
  constructor() {
    super("این آدرس متعلق به شما نیست");
  }
}

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

async function unsetOtherDefaults(
  tx: Prisma.TransactionClient,
  userId: string,
  excludeId?: string,
) {
  await tx.address.updateMany({
    where: {
      userId,
      isDefault: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    data: { isDefault: false },
  });
}

export async function createAddress(userId: string, input: CreateAddressInput) {
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) await unsetOtherDefaults(tx, userId);
    return tx.address.create({ data: { ...input, userId } });
  });
}

export async function updateAddress(
  userId: string,
  id: string,
  input: UpdateAddressInput,
) {
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing) throw new AddressNotFoundError(id);
  if (existing.userId !== userId) throw new AddressForbiddenError();

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) await unsetOtherDefaults(tx, userId, id);
    return tx.address.update({ where: { id }, data: input });
  });
}

export async function deleteAddress(userId: string, id: string) {
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing) throw new AddressNotFoundError(id);
  if (existing.userId !== userId) throw new AddressForbiddenError();
  await prisma.address.delete({ where: { id } });
}
