// collection-status.ts
export type CollectionStatus = "inactive" | "scheduled" | "ended" | "live";

export function getCollectionStatus(
  c: { isActive: boolean; startsAt: string | null; endsAt: string | null },
  now = new Date(),
): CollectionStatus {
  if (!c.isActive) return "inactive";
  if (c.startsAt && new Date(c.startsAt) > now) return "scheduled";
  if (c.endsAt && new Date(c.endsAt) < now) return "ended";
  return "live";
}
