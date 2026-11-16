import type { HeroSlide } from "./hero-types";

/**
 * Placeholder artwork generated as SVG data URIs, so the mock works with
 * no image files and no next.config remotePatterns. Swap these for real
 * photos (e.g. "/images/hero/1.jpg") when you have them.
 */
function art(
  w: number,
  h: number,
  p: { from: string; to: string; glow: string; fold: string },
) {
  const folds = Array.from({ length: 9 }, (_, i) => {
    const x = (w / 9) * i + (i % 2) * 18;
    return `<path d="M${x} 0 C ${x + 60} ${h * 0.35}, ${x - 50} ${h * 0.65}, ${x + 20} ${h}" stroke="${p.fold}" stroke-opacity="0.16" stroke-width="${
      i % 3 === 0 ? 3 : 1.5
    }" fill="none"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.from}"/><stop offset="1" stop-color="${p.to}"/></linearGradient>
<filter id="b"><feGaussianBlur stdDeviation="${Math.round(w / 14)}"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<ellipse cx="${w * 0.7}" cy="${h * 0.35}" rx="${w * 0.2}" ry="${h * 0.55}" fill="${p.glow}" opacity="0.55" filter="url(#b)"/>
<ellipse cx="${w * 0.25}" cy="${h * 0.9}" rx="${w * 0.25}" ry="${h * 0.4}" fill="${p.fold}" opacity="0.25" filter="url(#b)"/>
${folds}
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const sand = {
  from: "#e9dfd0",
  to: "#b9a88f",
  glow: "#fff4e0",
  fold: "#6b5a43",
};
const forest = {
  from: "#2c3a33",
  to: "#10161a",
  glow: "#6f8b7a",
  fold: "#c9d6cc",
};
const rose = {
  from: "#b88a94",
  to: "#4e2f3d",
  glow: "#f1c9cf",
  fold: "#2a141e",
};
const mist = {
  from: "#dfe5ea",
  to: "#9aa8b5",
  glow: "#ffffff",
  fold: "#3b4756",
};

const base = {
  ctaTargetId: null,
  sortOrder: 0,
  isActive: true,
  startsAt: null,
  endsAt: null,
} as const;

export const MOCK_HERO_SLIDES: HeroSlide[] = [
  {
    ...base,
    id: "hero-1",
    sortOrder: 1,
    eyebrow: "کالکشن پاییز ۱۴۰۵",
    title: "لباسی که با تو\nآرام‌تر حرف می‌زند",
    description:
      "پارچه‌های طبیعی، برش‌های ساده و رنگ‌هایی که از فصلی به فصل دیگر می‌مانند.",
    image: art(2400, 900, sand),
    mobileImage: art(900, 1200, sand),
    imageAlt: "کالکشن پاییزی با رنگ‌های خاکی",
    focalX: 70,
    focalY: 40,
    ctaLabel: "دیدن کالکشن",
    ctaType: "COLLECTION",
    ctaSlug: "autumn-collection",
    desktopPosition: "CENTER_LEFT",
    mobilePosition: "BOTTOM_LEFT",
    textTone: "DARK",
  },
  {
    ...base,
    id: "hero-2",
    sortOrder: 2,
    eyebrow: "پوشاک مردانه",
    title: "کت‌های پشمی\nبرای روزهای سرد",
    description: "دوخت دقیق، آستر نرم و فرمی که هم رسمی است و هم روزمره.",
    image: art(2400, 900, forest),
    mobileImage: art(900, 1200, forest),
    imageAlt: "کت پشمی مردانه",
    focalX: 30,
    focalY: 50,
    ctaLabel: "خرید کت‌های مردانه",
    ctaType: "CATEGORY",
    ctaSlug: "men-coats",
    desktopPosition: "CENTER_RIGHT",
    mobilePosition: "CENTER",
    textTone: "LIGHT",
  },
  {
    ...base,
    id: "hero-3",
    sortOrder: 3,
    eyebrow: null,
    title: "مانتوی ابریشمی\nمدل سحر",
    description: "سبک، روان و آماده‌ی ارسال در همه‌ی سایزها.",
    image: art(2400, 900, rose),
    mobileImage: null,
    imageAlt: "مانتوی ابریشمی رنگ رز",
    focalX: 50,
    focalY: 50,
    ctaLabel: "مشاهده محصول",
    ctaType: "PRODUCT",
    ctaSlug: "sahar-silk-manteau",
    desktopPosition: "BOTTOM_LEFT",
    mobilePosition: "BOTTOM_CENTER",
    textTone: "LIGHT",
  },
  {
    ...base,
    id: "hero-4",
    sortOrder: 4,
    eyebrow: "تخفیف فصلی",
    title: "تا ۳۰٪ تخفیف\nروی انتخاب‌های روزمره",
    description: null,
    image: art(2400, 900, mist),
    mobileImage: art(900, 1200, mist),
    imageAlt: "تخفیف فصلی روی لباس‌های روزمره",
    focalX: 60,
    focalY: 30,
    ctaLabel: null,
    ctaType: null,
    ctaSlug: null,
    desktopPosition: "TOP_RIGHT",
    mobilePosition: "TOP_CENTER",
    textTone: "DARK",
  },
];
