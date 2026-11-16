export type HeroContentPosition =
  | "TOP_LEFT"
  | "TOP_CENTER"
  | "TOP_RIGHT"
  | "CENTER_LEFT"
  | "CENTER"
  | "CENTER_RIGHT"
  | "BOTTOM_LEFT"
  | "BOTTOM_CENTER"
  | "BOTTOM_RIGHT";

export type HeroCtaType = "PRODUCT" | "COLLECTION" | "CATEGORY";

export type HeroTextTone = "LIGHT" | "DARK";

/**
 * Shape returned by GET /api/hero-slides. Move/re-export this from
 * @/redux/services/heroSlideApi if you prefer to keep types there.
 */
export interface HeroSlide {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  image: string;
  mobileImage: string | null;
  imageAlt: string | null;
  focalX: number;
  focalY: number;
  ctaLabel: string | null;
  ctaType: HeroCtaType | null;
  ctaTargetId: string | null;
  ctaSlug: string | null;
  desktopPosition: HeroContentPosition;
  mobilePosition: HeroContentPosition;
  textTone: HeroTextTone;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}
