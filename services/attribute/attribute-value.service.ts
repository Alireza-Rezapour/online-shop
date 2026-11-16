import type { Prisma } from "@/lib/generated/prisma/client";
import type { AttributeValueInput } from "./attribute.schema";

/**
 * Makes the values of an attribute match `inputs` exactly.
 * - values with an id are renamed
 * - values without an id are created
 * - existing values missing from `inputs` are deleted (blocked if used by products)
 */
export async function syncAttributeValuesService(
  tx: Prisma.TransactionClient,
  attributeId: string,
  inputs: AttributeValueInput[],
) {
  const existing = await tx.attributeValue.findMany({
    where: { attributeId },
    include: { _count: { select: { products: true } } },
  });
  const existingById = new Map(existing.map((v) => [v.id, v]));

  const keptIds = inputs.flatMap((i) => (i.id ? [i.id] : []));

  for (const id of keptIds) {
    if (!existingById.has(id)) {
      throw new Error("Value does not belong to this attribute");
    }
  }
  if (new Set(keptIds).size !== keptIds.length) {
    throw new Error("Duplicate value ids in request");
  }

  const kept = new Set(keptIds);
  const removed = existing.filter((v) => !kept.has(v.id));
  const blocked = removed.filter((v) => v._count.products > 0);

  if (blocked.length > 0) {
    throw new Error(
      `These values are used by products and cannot be removed: ${blocked
        .map((v) => v.value)
        .join(", ")}`,
    );
  }

  if (removed.length > 0) {
    await tx.attributeValue.deleteMany({
      where: { id: { in: removed.map((v) => v.id) } },
    });
  }

  // (attributeId, value) is unique, so renames that swap values would collide.
  // Park every renamed value on a temporary name first.
  const renamed = inputs.filter(
    (i) => i.id && existingById.get(i.id)!.value !== i.value,
  );
  for (const input of renamed) {
    await tx.attributeValue.update({
      where: { id: input.id! },
      data: { value: `__tmp__${input.id}` },
    });
  }

  for (const input of renamed) {
    await tx.attributeValue.update({
      where: { id: input.id! },
      data: { value: input.value },
    });
  }

  const created = inputs.filter((i) => !i.id);
  if (created.length > 0) {
    await tx.attributeValue.createMany({
      data: created.map((i) => ({ attributeId, value: i.value })),
    });
  }
}
