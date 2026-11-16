// src/lib/errors/group-zod-issues.ts
import type { ZodIssue } from "zod";

const KNOWN_SCALAR_FIELDS = new Set([
  "title",
  "slug",
  "description",
  "categoryId",
  "basePrice",
  "salePrice",
]);
const KNOWN_ARRAY_FIELDS = new Set([
  "variants",
  "images",
  "attributes",
  "collectionIds",
]);

export function groupZodIssues(issues: ZodIssue[]) {
  const fieldErrors: Record<string, string[]> = {};
  const formErrors: string[] = [];
  const seen = new Set<string>();

  for (const issue of issues) {
    const topField = String(issue.path[0] ?? "");

    if (issue.path.length === 1 && KNOWN_SCALAR_FIELDS.has(topField)) {
      fieldErrors[topField] = [...(fieldErrors[topField] ?? []), issue.message];
      continue;
    }
    if (KNOWN_ARRAY_FIELDS.has(topField)) {
      fieldErrors[topField] = [...(fieldErrors[topField] ?? []), issue.message];
    }
    if (!seen.has(issue.message)) {
      seen.add(issue.message);
      formErrors.push(issue.message);
    }
  }

  return { fieldErrors, formErrors };
}
