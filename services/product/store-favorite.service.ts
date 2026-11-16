import prisma from "@/lib/prisma";

export async function getFavoriteProductIdsService(
  userId: string,
  productIds: string[],
): Promise<string[]> {
  if (productIds.length === 0) return [];

  const rows = await prisma.favorite.findMany({
    where: { userId, productId: { in: productIds } },
    select: { productId: true },
  });
  return rows.map((row) => row.productId);
}
