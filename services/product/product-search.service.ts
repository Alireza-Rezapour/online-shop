import prisma from "@/lib/prisma";
import { getCategoryAndDescendantIds } from "./product-list.service";

const MAX_HITS = 500;

// Same folding as the SQL side: Arabic ي/ك -> ی/ک, ZWNJ -> space
const fold = (s: string) =>
  s
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .toLowerCase();

// "شلوار جین" -> "شلوار:* & جین:*"  (every word is a prefix match, all words must match)
// Only letters/digits survive, so user input can never inject tsquery operators.
function toPrefixQuery(raw: string): string | null {
  const tokens = fold(raw)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 6);
  return tokens.length ? tokens.map((t) => `${t}:*`).join(" & ") : null;
}

/**
 * Published product ids matching `raw`, best match first:
 *  1. title matches (full-text prefix, or plain substring)
 *  2. products inside a category whose name matches (so "شلوار" also finds a
 *     product titled "مام فیت" that lives in the شلوار category)
 */
export async function searchProductIds(raw: string): Promise<string[]> {
  const q = raw.trim();
  const tsq = toPrefixQuery(q);
  if (!tsq || q.length < 2) return [];

  // escape LIKE wildcards in user input
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;

  const matchedCategories = await prisma.category.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    select: { id: true },
    take: 5,
  });
  const categoryIds = (
    await Promise.all(
      matchedCategories.map((c) => getCategoryAndDescendantIds(c.id)),
    )
  ).flat();

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p."id"
    FROM "Product" p
    WHERE p."isPublished" = true
      AND (
        p."searchVector" @@ to_tsquery('simple', ${tsq})
        OR p."title" ILIKE ${pattern}
        OR p."categoryId" = ANY(${categoryIds}::text[])
      )
    ORDER BY
      (p."searchVector" @@ to_tsquery('simple', ${tsq}) OR p."title" ILIKE ${pattern}) DESC,
      ts_rank(p."searchVector", to_tsquery('simple', ${tsq})) DESC,
      p."createdAt" DESC
    LIMIT ${MAX_HITS}
  `;

  return rows.map((r) => r.id);
}
