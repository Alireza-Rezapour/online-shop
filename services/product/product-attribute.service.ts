import prisma from "@/lib/prisma";
import type { ProductAttributesInput } from "./product.schema";
import {
  getProductAdminService,
  type ProductAdminDto,
} from "./product.service";

export async function saveProductAttributesService(
  productId: string,
  input: ProductAttributesInput,
): Promise<ProductAdminDto> {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });
    if (!product) throw new Error("Product not found");

    const allowed = new Set(
      (
        await tx.categoryAttribute.findMany({
          where: { categoryId: product.categoryId },
          select: { attributeId: true },
        })
      ).map((a) => a.attributeId),
    );

    for (const pair of input.attributes) {
      if (!allowed.has(pair.attributeId)) {
        throw new Error(
          "An attribute does not belong to this product's category",
        );
      }
    }

    const valueIds = input.attributes.map((a) => a.attributeValueId);
    const values = await tx.attributeValue.findMany({
      where: { id: { in: valueIds } },
      select: { id: true, attributeId: true },
    });
    const valueById = new Map(values.map((v) => [v.id, v]));

    for (const pair of input.attributes) {
      const value = valueById.get(pair.attributeValueId);
      if (!value || value.attributeId !== pair.attributeId) {
        throw new Error("An attribute value does not belong to its attribute");
      }
    }

    await tx.productAttribute.deleteMany({ where: { productId } });
    if (input.attributes.length > 0) {
      await tx.productAttribute.createMany({
        data: input.attributes.map((a) => ({
          productId,
          attributeId: a.attributeId,
          attributeValueId: a.attributeValueId,
        })),
      });
    }

    return getProductAdminService(productId, tx);
  });
}
