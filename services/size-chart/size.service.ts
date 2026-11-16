import type { Prisma } from "@/lib/generated/prisma/client";
import type { SizeInput } from "./size-chart.schema";

/**
 * Makes the sizes of a chart match `inputs` exactly.
 * - sizes with an id are renamed and re-ordered
 * - sizes without an id are created
 * - existing sizes missing from `inputs` are deleted (blocked if used by variants)
 */
export async function syncChartSizesService(
  tx: Prisma.TransactionClient,
  chartId: string,
  inputs: SizeInput[],
) {
  const existing = await tx.size.findMany({
    where: { sizeChartId: chartId },
    include: { _count: { select: { variants: true } } },
  });
  const existingById = new Map(existing.map((s) => [s.id, s]));

  const keptIds = inputs.flatMap((i) => (i.id ? [i.id] : []));

  for (const id of keptIds) {
    if (!existingById.has(id)) {
      throw new Error("Size does not belong to this size chart");
    }
  }
  if (new Set(keptIds).size !== keptIds.length) {
    throw new Error("Duplicate size ids in request");
  }

  const kept = new Set(keptIds);
  const removed = existing.filter((s) => !kept.has(s.id));
  const blocked = removed.filter((s) => s._count.variants > 0);

  if (blocked.length > 0) {
    throw new Error(
      `These sizes are used by products and cannot be removed: ${blocked
        .map((s) => s.name)
        .join(", ")}`,
    );
  }

  if (removed.length > 0) {
    await tx.size.deleteMany({
      where: { id: { in: removed.map((s) => s.id) } },
    });
  }

  // (sizeChartId, name) is unique, so renames that swap names (M->L, L->M)
  // would collide. Park every renamed size on a temporary name first.
  const renamed = inputs.filter(
    (i) => i.id && existingById.get(i.id)!.name !== i.name,
  );
  for (const input of renamed) {
    await tx.size.update({
      where: { id: input.id! },
      data: { name: `__tmp__${input.id}` },
    });
  }

  for (const [index, input] of inputs.entries()) {
    if (input.id) {
      await tx.size.update({
        where: { id: input.id },
        data: { name: input.name, sortOrder: index },
      });
    } else {
      await tx.size.create({
        data: { sizeChartId: chartId, name: input.name, sortOrder: index },
      });
    }
  }
}
