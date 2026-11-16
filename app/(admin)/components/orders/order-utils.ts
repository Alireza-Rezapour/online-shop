import type { AdminOrderUser } from "./types";

export function getCustomerName(
  user: AdminOrderUser | null | undefined,
): string {
  if (!user) return "—";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.name;
}
