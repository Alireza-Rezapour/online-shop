import type { CategoryDto } from "@/services/category/category.service";

export type CategoryNode = CategoryDto & {
  children: CategoryNode[];
  depth: number;
};

export function buildCategoryTree(categories: CategoryDto[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>(
    categories.map((c) => [c.id, { ...c, children: [], depth: 0 }]),
  );
  const roots: CategoryNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortLevel = (list: CategoryNode[], depth: number) => {
    list.sort((a, b) => a.name.localeCompare(b.name, "fa"));
    for (const node of list) {
      node.depth = depth;
      sortLevel(node.children, depth + 1);
    }
  };
  sortLevel(roots, 0);

  return roots;
}

// Depth-first list, so parents always come right before their children
export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

export function collectDescendantIds(node: CategoryNode): string[] {
  return node.children.flatMap((child) => [
    child.id,
    ...collectDescendantIds(child),
  ]);
}

export function getCategoryPath(
  id: string,
  byId: Map<string, CategoryNode>,
): string {
  const parts: string[] = [];
  let current = byId.get(id);

  while (current) {
    parts.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return parts.join(" / ");
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message ?? data?.error ?? fallback;
}
