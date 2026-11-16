import prisma from "@/lib/prisma";
import type { ProductVariantsInput } from "./product.schema";
import {
  getProductAdminService,
  type ProductAdminDto,
} from "./product.service";

/**
 * Makes the variants of a product match `input.variants` exactly.
 * - items with an id are updated (sku, price, salePrice, stock)
 * - items without an id are created
 * - existing variants missing from the input are deleted (blocked if they have orders)
 */
export async function saveProductVariantsService(
  productId: string,
  input: ProductVariantsInput,
): Promise<ProductAdminDto> {
  return prisma.$transaction(
    async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: {
          basePrice: true,
          category: { select: { sizeChartId: true } },
        },
      });
      if (!product) throw new Error("Product not found");

      const { variants } = input;
      const chartId = product.category.sizeChartId;

      const colorIds = [...new Set(variants.map((v) => v.colorId))];
      const sizeIds = [...new Set(variants.map((v) => v.sizeId))];

      if (colorIds.length > 0) {
        const count = await tx.color.count({ where: { id: { in: colorIds } } });
        if (count !== colorIds.length)
          throw new Error("One or more colors not found");
      }

      if (sizeIds.length > 0) {
        const sizes = await tx.size.findMany({
          where: { id: { in: sizeIds } },
          select: { sizeChartId: true },
        });
        if (sizes.length !== sizeIds.length)
          throw new Error("One or more sizes not found");
        if (sizes.some((s) => s.sizeChartId !== chartId)) {
          throw new Error("Sizes must belong to the category's size chart");
        }
      }

      for (const v of variants) {
        const effective = v.price ?? product.basePrice;
        if (v.salePrice != null && v.salePrice >= effective) {
          throw new Error(
            `Sale price of ${v.sku} must be lower than its price`,
          );
        }
      }

      const existing = await tx.productVariant.findMany({
        where: { productId },
        include: { _count: { select: { orderItems: true } } },
      });
      const existingById = new Map(existing.map((v) => [v.id, v]));

      const keptIds = variants.flatMap((v) => (v.id ? [v.id] : []));
      for (const id of keptIds) {
        if (!existingById.has(id))
          throw new Error("Variant does not belong to this product");
      }
      if (new Set(keptIds).size !== keptIds.length) {
        throw new Error("Duplicate variant ids in request");
      }

      for (const v of variants) {
        if (!v.id) continue;
        const current = existingById.get(v.id)!;
        if (current.colorId !== v.colorId || current.sizeId !== v.sizeId) {
          throw new Error(
            "The color and size of an existing variant cannot be changed",
          );
        }
        if (v.stock < current.reservedStock) {
          throw new Error(
            `Stock of ${v.sku} cannot be lower than its reserved stock (${current.reservedStock})`,
          );
        }
      }

      const kept = new Set(keptIds);
      const removed = existing.filter((v) => !kept.has(v.id));
      const blocked = removed.filter((v) => v._count.orderItems > 0);
      if (blocked.length > 0) {
        throw new Error(
          `These variants have orders and cannot be removed: ${blocked
            .map((v) => v.sku)
            .join(", ")}`,
        );
      }

      if (removed.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: removed.map((v) => v.id) } },
        });
      }

      // A new variant must not reuse the color/size of a kept one
      const keptCombos = new Set(
        existing
          .filter((v) => kept.has(v.id))
          .map((v) => `${v.colorId}:${v.sizeId}`),
      );
      for (const v of variants) {
        if (!v.id && keptCombos.has(`${v.colorId}:${v.sizeId}`)) {
          throw new Error(
            `A variant for this color and size already exists (${v.sku})`,
          );
        }
      }

      // SKUs are unique across all products
      const conflict = await tx.productVariant.findFirst({
        where: { sku: { in: variants.map((v) => v.sku) }, NOT: { productId } },
        select: { sku: true },
      });
      if (conflict)
        throw new Error(
          `SKU ${conflict.sku} is already used by another product`,
        );

      // SKUs that change could collide while swapping; park them on a temp value first
      const renamed = variants.filter(
        (v) => v.id && existingById.get(v.id)!.sku !== v.sku,
      );
      for (const v of renamed) {
        await tx.productVariant.update({
          where: { id: v.id! },
          data: { sku: `__TMP__${v.id}` },
        });
      }

      for (const v of variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              price: v.price ?? null,
              salePrice: v.salePrice ?? null,
              stock: v.stock,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId,
              colorId: v.colorId,
              sizeId: v.sizeId,
              sku: v.sku,
              price: v.price ?? null,
              salePrice: v.salePrice ?? null,
              stock: v.stock,
            },
          });
        }
      }

      return getProductAdminService(productId, tx);
    },
    { timeout: 20000 },
  );
}
