import type { AdminLookDto } from "@/services/look/look.types";

export function getLookStatus(
  look: Pick<AdminLookDto, "isPublished" | "startsAt" | "endsAt">,
) {
  const now = Date.now();
  if (!look.isPublished)
    return { label: "پیش‌نویس", variant: "secondary" as const };
  if (look.startsAt && new Date(look.startsAt).getTime() > now)
    return { label: "زمان‌بندی‌شده", variant: "outline" as const };
  if (look.endsAt && new Date(look.endsAt).getTime() < now)
    return { label: "منقضی‌شده", variant: "destructive" as const };
  return { label: "منتشر شده", variant: "default" as const };
}
