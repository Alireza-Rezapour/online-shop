import prisma from "@/lib/prisma";
import type { ProductImagesInput } from "./product.schema";
import {
  getProductAdminService,
  type ProductAdminDto,
} from "./product.service";

export async function saveProductImagesService(
  productId: string,
  input: ProductImagesInput,
): Promise<ProductAdminDto> {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { title: true },
    });
    if (!product) throw new Error("Product not found");

    await tx.product.update({
      where: { id: productId },
      data: { coverImage: input.coverImage, hoverImage: input.hoverImage },
    });

    await tx.productImage.deleteMany({ where: { productId } });
    if (input.images.length > 0) {
      await tx.productImage.createMany({
        data: input.images.map((image, index) => ({
          productId,
          url: image.url,
          alt: image.alt?.trim() || product.title,
          sortOrder: index,
        })),
      });
    }

    return getProductAdminService(productId, tx);
  });
}
