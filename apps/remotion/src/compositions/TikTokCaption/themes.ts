import type { FontKey } from "./config";

/**
 * Curated caption looks. A theme bundles the structural traits the four
 * universal style controls can't express (uppercase, stroke, phrase
 * background, active-word chip) with starter values for the controls the
 * user can still tweak afterwards (font, text color, accent).
 *
 * Rendering sticks to plain fills, strokes and shadows so every theme
 * survives @remotion/web-renderer exports unchanged.
 */
export type CaptionThemeDef = {
  id: string;
  label: string;
  /** Starter values applied to the editable style when the theme is picked. */
  fontKey: FontKey;
  textColor: string;
  accentColor: string;
  /** Structural traits, fixed per theme. */
  uppercase?: boolean;
  italic?: boolean;
  /** Black outline around glyphs (the classic TikTok look). */
  stroke?: boolean;
  /** Outline-only: glyph fill goes transparent, stroke takes the text color. */
  hollow?: boolean;
  shadow: "none" | "soft" | "heavy";
  /** Solid box painted behind the whole phrase. */
  phraseBackground?: string;
  /** Emphasize the spoken word with an accent-colored chip instead of recolor. */
  activeWordBackground?: boolean;
};

export const CAPTION_THEME_LIST: CaptionThemeDef[] = [
  {
    id: "classic",
    label: "Classic",
    fontKey: "anton",
    textColor: "#ffffff",
    accentColor: "#facc15",
    stroke: true,
    shadow: "soft",
  },
  {
    id: "karaoke",
    label: "Karaoke",
    fontKey: "anton",
    textColor: "#ffffff",
    accentColor: "#22c55e",
    stroke: true,
    shadow: "soft",
    activeWordBackground: true,
  },
  {
    id: "hormozi",
    label: "Hormozi",
    fontKey: "poppins",
    textColor: "#ffffff",
    accentColor: "#4ade80",
    uppercase: true,
    shadow: "heavy",
  },
  {
    id: "boxed",
    label: "Boxed",
    fontKey: "archivoBlack",
    textColor: "#111111",
    accentColor: "#dc2626",
    shadow: "none",
    phraseBackground: "#ffffff",
  },
  {
    id: "highlight",
    label: "Highlight",
    fontKey: "anton",
    textColor: "#111111",
    accentColor: "#7c2d12",
    shadow: "none",
    phraseBackground: "#fde047",
  },
  {
    id: "clean",
    label: "Clean",
    fontKey: "poppins",
    textColor: "#ffffff",
    accentColor: "#60a5fa",
    shadow: "soft",
  },
  {
    id: "outline",
    label: "Outline",
    fontKey: "anton",
    textColor: "#ffffff",
    accentColor: "#facc15",
    uppercase: true,
    stroke: true,
    hollow: true,
    shadow: "none",
  },
  {
    id: "retro",
    label: "Retro",
    fontKey: "bebas",
    textColor: "#fef3c7",
    accentColor: "#f97316",
    italic: true,
    stroke: true,
    shadow: "soft",
  },
];

export const CAPTION_THEMES: Record<string, CaptionThemeDef> =
  Object.fromEntries(CAPTION_THEME_LIST.map((t) => [t.id, t]));

export const DEFAULT_CAPTION_THEME = "classic";
