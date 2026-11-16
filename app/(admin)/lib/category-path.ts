// app/(admin)/lib/category-path.ts
import { Category } from "./types";

export function getCategoryPath(
  categoryId: string,
  categories: Category[],
): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const path: Category[] = [];
  let current = byId.get(categoryId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}

export function getLeafCategories(categories: Category[]): Category[] {
  const parentIds = new Set(
    categories.filter((c) => c.parentId).map((c) => c.parentId as string),
  );
  return categories.filter((c) => !parentIds.has(c.id));
}
