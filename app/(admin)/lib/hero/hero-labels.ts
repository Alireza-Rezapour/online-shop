import type {
  HeroContentPosition,
  HeroCtaType,
  HeroSlide,
} from "@/components/hero/hero-types";

export const HERO_CTA_TYPE_LABELS: Record<HeroCtaType, string> = {
  PRODUCT: "محصول",
  COLLECTION: "کالکشن",
  CATEGORY: "دسته‌بندی",
};

export const HERO_CTA_TYPE_OPTIONS = (
  Object.keys(HERO_CTA_TYPE_LABELS) as HeroCtaType[]
).map((value) => ({ value, label: HERO_CTA_TYPE_LABELS[value] }));

/** Left / right are physical sides of the screen, as the admin sees them. */
export const HERO_POSITION_LABELS: Record<HeroContentPosition, string> = {
  TOP_LEFT: "بالا، چپ",
  TOP_CENTER: "بالا، وسط",
  TOP_RIGHT: "بالا، راست",
  CENTER_LEFT: "وسط، چپ",
  CENTER: "مرکز",
  CENTER_RIGHT: "وسط، راست",
  BOTTOM_LEFT: "پایین، چپ",
  BOTTOM_CENTER: "پایین، وسط",
  BOTTOM_RIGHT: "پایین، راست",
};

/** Row by row, left to right. */
export const HERO_POSITION_GRID: HeroContentPosition[] = [
  "TOP_LEFT",
  "TOP_CENTER",
  "TOP_RIGHT",
  "CENTER_LEFT",
  "CENTER",
  "CENTER_RIGHT",
  "BOTTOM_LEFT",
  "BOTTOM_CENTER",
  "BOTTOM_RIGHT",
];

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/** What the storefront will actually do with this slide right now. */
export function getSlideStatus(
  slide: Pick<HeroSlide, "isActive" | "startsAt" | "endsAt">,
): { label: string; variant: BadgeVariant } {
  const now = Date.now();
  if (!slide.isActive) return { label: "غیرفعال", variant: "outline" };
  if (slide.startsAt && new Date(slide.startsAt).getTime() > now) {
    return { label: "زمان‌بندی‌شده", variant: "secondary" };
  }
  if (slide.endsAt && new Date(slide.endsAt).getTime() < now) {
    return { label: "منقضی", variant: "destructive" };
  }
  return { label: "در حال نمایش", variant: "default" };
}
