import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  CreateSizeChartInput,
  UpdateSizeChartInput,
} from "./size-chart.schema";
import { syncChartSizesService } from "./size.service";
import prisma from "@/lib/prisma";

const sizeChartInclude = {
  sizes: {
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { variants: true } } },
  },
  _count: { select: { categories: true } },
} satisfies Prisma.SizeChartInclude;

type SizeChartRecord = Prisma.SizeChartGetPayload<{
  include: typeof sizeChartInclude;
}>;

export type SizeDto = {
  id: string;
  name: string;
  sortOrder: number;
  variantCount: number;
};

export type SizeChartDto = {
  id: string;
  name: string;
  categoryCount: number;
  sizes: SizeDto[];
};

function toDto(chart: SizeChartRecord): SizeChartDto {
  return {
    id: chart.id,
    name: chart.name,
    categoryCount: chart._count.categories,
    sizes: chart.sizes.map((s) => ({
      id: s.id,
      name: s.name,
      sortOrder: s.sortOrder,
      variantCount: s._count.variants,
    })),
  };
}

async function assertNameAvailable(
  tx: Prisma.TransactionClient,
  name: string,
  excludeId?: string,
) {
  const existing = await tx.sizeChart.findUnique({
    where: { name },
    select: { id: true },
  });
  if (existing && existing.id !== excludeId) {
    throw new Error("A size chart with this name already exists");
  }
}

export async function getSizeChartsService(): Promise<SizeChartDto[]> {
  const charts = await prisma.sizeChart.findMany({
    include: sizeChartInclude,
    orderBy: { name: "asc" },
  });
  return charts.map(toDto);
}

export async function getSizeChartByIdService(
  id: string,
): Promise<SizeChartDto> {
  const chart = await prisma.sizeChart.findUnique({
    where: { id },
    include: sizeChartInclude,
  });
  if (!chart) throw new Error("Size chart not found");
  return toDto(chart);
}

export async function createSizeChartService(
  input: CreateSizeChartInput,
): Promise<SizeChartDto> {
  return prisma.$transaction(async (tx) => {
    await assertNameAvailable(tx, input.name);

    const created = await tx.sizeChart.create({
      data: {
        name: input.name,
        sizes: {
          create: input.sizes.map((size, index) => ({
            name: size.name,
            sortOrder: index,
          })),
        },
      },
      include: sizeChartInclude,
    });

    return toDto(created);
  });
}

export async function updateSizeChartService(
  id: string,
  input: UpdateSizeChartInput,
): Promise<SizeChartDto> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.sizeChart.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new Error("Size chart not found");

    await assertNameAvailable(tx, input.name, id);

    await tx.sizeChart.update({ where: { id }, data: { name: input.name } });
    await syncChartSizesService(tx, id, input.sizes);

    const updated = await tx.sizeChart.findUniqueOrThrow({
      where: { id },
      include: sizeChartInclude,
    });
    return toDto(updated);
  });
}

export async function deleteSizeChartService(
  id: string,
): Promise<{ id: string }> {
  const chart = await prisma.sizeChart.findUnique({
    where: { id },
    include: { sizes: { include: { _count: { select: { variants: true } } } } },
  });
  if (!chart) throw new Error("Size chart not found");

  if (chart.sizes.some((s) => s._count.variants > 0)) {
    throw new Error(
      "Cannot delete a size chart whose sizes are used by products",
    );
  }

  // Sizes are removed by cascade; categories fall back to no size chart (SetNull)
  await prisma.sizeChart.delete({ where: { id } });
  return { id };
}
