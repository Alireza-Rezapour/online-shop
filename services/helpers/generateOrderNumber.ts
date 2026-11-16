import type { Prisma } from "@/lib/generated/prisma/client";
import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nanoid = customAlphabet(alphabet, 8);

export async function generateOrderNumber(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = `ORD-${nanoid()}`;

    const exists = await tx.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (!exists) return orderNumber;
  }

  throw new Error(
    "Could not generate a unique order number. Please try again.",
  );
}
