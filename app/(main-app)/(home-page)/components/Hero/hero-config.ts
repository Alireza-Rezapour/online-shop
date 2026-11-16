import type { HeroContentPosition, HeroTextTone } from "./hero-types";

export const AUTOPLAY_MS = 6500;
export const WIPE_S = 0.95;
export const EASE_WIPE = [0.77, 0, 0.175, 1] as const;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Desktop is taller and runs under the floating navbar (the navbar's height is
 * included). Mobile is compact, with a floor so text never gets squeezed.
 */
export const HERO_HEIGHT =
  "h-[28svh] min-h-[230px] max-h-[330px] md:h-[76dvh] md:min-h-[560px] md:max-h-[800px]";

/** Text colour + the scrim that keeps it readable on any photo. */
export const TONE: Record<
  HeroTextTone,
  { text: string; frame: string; scrim: string; button: string }
> = {
  LIGHT: {
    text: "text-white",
    frame: "",
    scrim: "bg-linear-to-t from-black/55 via-black/15 to-black/20",
    button:
      "border-white/70 text-white hover:bg-white hover:text-neutral-950 rounded-2xl",
  },
  DARK: {
    text: "text-neutral-950",
    frame: "",
    scrim: "bg-linear-to-t from-white/55 via-white/15 to-white/20",
    button:
      "border-neutral-950/60 text-neutral-950 hover:bg-neutral-950 hover:text-white rounded-2xl",
  },
};

/* ------------------------------------------------------------------ */
/* Position mapping                                                     */
/* LEFT / RIGHT are physical (what the admin sees), independent of RTL. */
/* Tailwind needs full class strings, so every variant is spelled out.  */
/* ------------------------------------------------------------------ */

type V = "TOP" | "MIDDLE" | "BOTTOM";
type H = "LEFT" | "CENTER" | "RIGHT";

const GRID: Record<HeroContentPosition, [V, H]> = {
  TOP_LEFT: ["TOP", "LEFT"],
  TOP_CENTER: ["TOP", "CENTER"],
  TOP_RIGHT: ["TOP", "RIGHT"],
  CENTER_LEFT: ["MIDDLE", "LEFT"],
  CENTER: ["MIDDLE", "CENTER"],
  CENTER_RIGHT: ["MIDDLE", "RIGHT"],
  BOTTOM_LEFT: ["BOTTOM", "LEFT"],
  BOTTOM_CENTER: ["BOTTOM", "CENTER"],
  BOTTOM_RIGHT: ["BOTTOM", "RIGHT"],
};

const V_BASE: Record<V, string> = {
  TOP: "items-start",
  MIDDLE: "items-center",
  BOTTOM: "items-end",
};
const V_MD: Record<V, string> = {
  TOP: "md:items-start",
  MIDDLE: "md:items-center",
  BOTTOM: "md:items-end",
};

const H_BASE: Record<H, string> = {
  LEFT: "justify-start",
  CENTER: "justify-center",
  RIGHT: "justify-end",
};
const H_MD: Record<H, string> = {
  LEFT: "md:justify-start",
  CENTER: "md:justify-center",
  RIGHT: "md:justify-end",
};

// The text block hugs the edge it is placed against.
// Inside the dir="rtl" block: "start" is the right edge, "end" is the left edge.
const T_BASE: Record<H, string> = {
  LEFT: "items-end text-end",
  CENTER: "items-center text-center",
  RIGHT: "items-start text-start",
};
const T_MD: Record<H, string> = {
  LEFT: "md:items-end md:text-end",
  CENTER: "md:items-center md:text-center",
  RIGHT: "md:items-start md:text-start",
};

export function placement(
  mobile: HeroContentPosition,
  desktop: HeroContentPosition,
) {
  const [mv, mh] = GRID[mobile];
  const [dv, dh] = GRID[desktop];
  return {
    wrap: [V_BASE[mv], H_BASE[mh], V_MD[dv], H_MD[dh]].join(" "),
    inner: [T_BASE[mh], T_MD[dh]].join(" "),
  };
}
