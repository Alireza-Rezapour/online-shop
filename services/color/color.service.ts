import type { Prisma } from "@/lib/generated/prisma/client";
import type { CreateColorInput, UpdateColorInput } from "./color.schema";
import prisma from "@/lib/prisma";

const colorInclude = {
  _count: { select: { variants: true } },
} satisfies Prisma.ColorInclude;

type ColorRecord = Prisma.ColorGetPayload<{ include: typeof colorInclude }>;

export type ColorDto = {
  id: string;
  name: string;
  hex: string;
  code: string;
  variantCount: number;
};

function toDto(color: ColorRecord): ColorDto {
  return {
    id: color.id,
    name: color.name,
    hex: color.hex,
    code: color.code,
    variantCount: color._count.variants,
  };
}

async function assertUnique(
  tx: Prisma.TransactionClient,
  data: { name: string; hex: string; code: string },
  excludeId?: string,
) {
  const conflict = await tx.color.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [{ name: data.name }, { hex: data.hex }, { code: data.code }],
    },
  });
  if (!conflict) return;

  if (conflict.name === data.name) {
    throw new Error("A color with this name already exists");
  }
  if (conflict.hex === data.hex) {
    throw new Error("A color with this hex value already exists");
  }
  throw new Error("A color with this code already exists");
}

export async function getColorsService(): Promise<ColorDto[]> {
  const colors = await prisma.color.findMany({
    include: colorInclude,
    orderBy: { name: "asc" },
  });
  return colors.map(toDto);
}

export async function getColorByIdService(id: string): Promise<ColorDto> {
  const color = await prisma.color.findUnique({
    where: { id },
    include: colorInclude,
  });
  if (!color) throw new Error("Color not found");
  return toDto(color);
}

export async function createColorService(
  input: CreateColorInput,
): Promise<ColorDto> {
  return prisma.$transaction(async (tx) => {
    await assertUnique(tx, input);
    const created = await tx.color.create({
      data: { name: input.name, hex: input.hex, code: input.code },
      include: colorInclude,
    });
    return toDto(created);
  });
}

export async function updateColorService(
  id: string,
  input: UpdateColorInput,
): Promise<ColorDto> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.color.findUnique({
      where: { id },
      include: colorInclude,
    });
    if (!existing) throw new Error("Color not found");

    if (existing.code !== input.code && existing._count.variants > 0) {
      throw new Error(
        "The code cannot be changed once the color is used by product variants",
      );
    }

    await assertUnique(tx, input, id);

    const updated = await tx.color.update({
      where: { id },
      data: { name: input.name, hex: input.hex, code: input.code },
      include: colorInclude,
    });
    return toDto(updated);
  });
}

export async function deleteColorService(id: string): Promise<{ id: string }> {
  const color = await prisma.color.findUnique({
    where: { id },
    select: { _count: { select: { variants: true } } },
  });
  if (!color) throw new Error("Color not found");

  if (color._count.variants > 0) {
    throw new Error("Cannot delete a color that is used by product variants");
  }

  await prisma.color.delete({ where: { id } });
  return { id };
}
