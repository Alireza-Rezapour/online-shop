import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  CreateAttributeInput,
  UpdateAttributeInput,
} from "./attribute.schema";
import { syncAttributeValuesService } from "./attribute-value.service";
import prisma from "@/lib/prisma";

const attributeInclude = {
  values: {
    orderBy: { value: "asc" },
    include: { _count: { select: { products: true } } },
  },
  _count: { select: { categories: true, productAttributes: true } },
} satisfies Prisma.AttributeInclude;

type AttributeRecord = Prisma.AttributeGetPayload<{
  include: typeof attributeInclude;
}>;

export type AttributeValueDto = {
  id: string;
  value: string;
  productCount: number;
};

export type AttributeDto = {
  id: string;
  name: string;
  categoryCount: number;
  productCount: number;
  values: AttributeValueDto[];
};

function toDto(attribute: AttributeRecord): AttributeDto {
  return {
    id: attribute.id,
    name: attribute.name,
    categoryCount: attribute._count.categories,
    productCount: attribute._count.productAttributes,
    values: attribute.values.map((v) => ({
      id: v.id,
      value: v.value,
      productCount: v._count.products,
    })),
  };
}

async function assertNameAvailable(
  tx: Prisma.TransactionClient,
  name: string,
  excludeId?: string,
) {
  const existing = await tx.attribute.findUnique({
    where: { name },
    select: { id: true },
  });
  if (existing && existing.id !== excludeId) {
    throw new Error("An attribute with this name already exists");
  }
}

export async function getAttributesService(): Promise<AttributeDto[]> {
  const attributes = await prisma.attribute.findMany({
    include: attributeInclude,
    orderBy: { name: "asc" },
  });
  return attributes.map(toDto);
}

export async function getAttributeByIdService(
  id: string,
): Promise<AttributeDto> {
  const attribute = await prisma.attribute.findUnique({
    where: { id },
    include: attributeInclude,
  });
  if (!attribute) throw new Error("Attribute not found");
  return toDto(attribute);
}

export async function createAttributeService(
  input: CreateAttributeInput,
): Promise<AttributeDto> {
  return prisma.$transaction(async (tx) => {
    await assertNameAvailable(tx, input.name);

    const created = await tx.attribute.create({
      data: {
        name: input.name,
        values: { create: input.values.map((v) => ({ value: v.value })) },
      },
      include: attributeInclude,
    });

    return toDto(created);
  });
}

export async function updateAttributeService(
  id: string,
  input: UpdateAttributeInput,
): Promise<AttributeDto> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.attribute.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new Error("Attribute not found");

    await assertNameAvailable(tx, input.name, id);

    await tx.attribute.update({ where: { id }, data: { name: input.name } });
    await syncAttributeValuesService(tx, id, input.values);

    const updated = await tx.attribute.findUniqueOrThrow({
      where: { id },
      include: attributeInclude,
    });
    return toDto(updated);
  });
}

export async function deleteAttributeService(
  id: string,
): Promise<{ id: string }> {
  const attribute = await prisma.attribute.findUnique({
    where: { id },
    select: { _count: { select: { productAttributes: true } } },
  });
  if (!attribute) throw new Error("Attribute not found");

  if (attribute._count.productAttributes > 0) {
    throw new Error("Cannot delete an attribute that is used by products");
  }

  // Values and category links are removed by cascade
  await prisma.attribute.delete({ where: { id } });
  return { id };
}
