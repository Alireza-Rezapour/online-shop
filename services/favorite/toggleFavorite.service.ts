import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

/**
 * Adds the product to the user's favorites, or removes it when it is already there.
 */
export async function toggleFavoriteService(
  userId: string,
  productId: string,
): Promise<{ favorited: boolean }> {
  // Removing needs no other checks and is atomic: the count says whether it existed
  const removed = await prisma.favorite.deleteMany({
    where: { userId, productId },
  });
  if (removed.count > 0) return { favorited: false };

  // Only a product that can be seen in the shop can be favorited
  const product = await prisma.product.findFirst({
    where: { id: productId, isPublished: true },
    select: { id: true },
  });
  if (!product) throw new Error("Product not found");

  try {
    await prisma.favorite.create({ data: { userId, productId } });
  } catch (error) {
    // A double click created it a moment ago: it is a favorite either way
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { favorited: true };
    }
    throw error;
  }

  return { favorited: true };
}
