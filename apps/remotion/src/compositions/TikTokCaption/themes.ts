import type { FontKey } from "./config";

/**
 * Curated caption looks modeled on what's actually viral on TikTok:
 * Hormozi/Dan Koe Montserrat-caps with a color-highlighted keyword,
 * MrBeast-style heavy display type, native-TikTok per-line pills, CapCut
 * karaoke word chips, Bebas neon for fitness/motivation, Inter minimal for
 * design/aesthetic content, and the lowercase-serif "aesthetic" trend.
 *
 * A theme bundles the structural traits the four universal style controls
 * can't express (case, stroke, pills, chips, glow) with starter values for
 * the controls the user can still tweak afterwards (font, text color,
 * accent). Rendering sticks to plain fills, strokes and shadows so every
 * theme survives @remotion/web-renderer exports unchanged.
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
  lowercase?: boolean;
  italic?: boolean;
  /** Black outline around glyphs (the classic TikTok look). */
  stroke?: boolean;
  /** Outline-only: glyph fill goes transparent, stroke takes the text color. */
  hollow?: boolean;
  shadow: "none" | "soft" | "heavy" | "glow";
  /** Rounded pill painted behind each caption LINE (native TikTok style). */
  lineBackground?: string;
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
    // The podcast-clip look everywhere on TikTok/Reels: slanted heavy caps,
    // black stroke, spoken word flips yellow.
    id: "viral",
    label: "VIRAL",
    fontKey: "montserrat",
    textColor: "#ffffff",
    accentColor: "#fde047",
    uppercase: true,
    italic: true,
    stroke: true,
    shadow: "heavy",
  },
  {
    id: "hormozi",
    label: "Hormozi",
    fontKey: "montserrat",
    textColor: "#ffffff",
    accentColor: "#4ade80",
    uppercase: true,
    italic: true,
    stroke: true,
    shadow: "heavy",
  },
  {
    id: "beast",
    label: "Beast",
    fontKey: "lilitaOne",
    textColor: "#ffffff",
    accentColor: "#ffd900",
    uppercase: true,
    stroke: true,
    shadow: "heavy",
  },
  {
    id: "tiktok",
    label: "TikTok",
    fontKey: "poppins",
    textColor: "#ffffff",
    accentColor: "#25f4ee",
    shadow: "none",
    lineBackground: "rgba(0, 0, 0, 0.6)",
  },
  {
    id: "sticker",
    label: "Sticker",
    fontKey: "montserrat",
    textColor: "#111111",
    accentColor: "#dc2626",
    shadow: "none",
    lineBackground: "#ffffff",
  },
  {
    id: "karaoke",
    label: "Karaoke",
    fontKey: "poppins",
    textColor: "#ffffff",
    accentColor: "#22c55e",
    stroke: true,
    shadow: "soft",
    activeWordBackground: true,
  },
  {
    id: "neon",
    label: "Neon",
    fontKey: "bebas",
    textColor: "#ffffff",
    accentColor: "#22d3ee",
    uppercase: true,
    shadow: "glow",
  },
  {
    id: "minimal",
    label: "Minimal",
    fontKey: "inter",
    textColor: "#ffffff",
    accentColor: "#93c5fd",
    shadow: "soft",
  },
  {
    id: "aesthetic",
    label: "aesthetic",
    fontKey: "playfair",
    textColor: "#fff7ed",
    accentColor: "#fda4af",
    lowercase: true,
    italic: true,
    shadow: "soft",
  },
  {
    // Opus Clip's viral podcast look: caps with a purple chip popping on
    // the spoken word.
    id: "podcast",
    label: "Podcast",
    fontKey: "montserrat",
    textColor: "#ffffff",
    accentColor: "#8b5cf6",
    uppercase: true,
    shadow: "heavy",
    activeWordBackground: true,
  },
  {
    // The clean CapCut "documentary" look: heavy sentence-case type, no
    // stroke, just depth — luxury/self-improvement channels.
    id: "docu",
    label: "Docu",
    fontKey: "archivoBlack",
    textColor: "#ffffff",
    accentColor: "#facc15",
    shadow: "heavy",
  },
  {
    // Fashion-edit outline type: hollow glyphs, the spoken word fills solid.
    id: "outline",
    label: "OUTLINE",
    fontKey: "anton",
    textColor: "#ffffff",
    accentColor: "#ffffff",
    uppercase: true,
    stroke: true,
    hollow: true,
    shadow: "soft",
  },
  {
    // Y2K girlblogger glow: lowercase with a hot-pink halo.
    id: "y2k",
    label: "y2k",
    fontKey: "poppins",
    textColor: "#ffffff",
    accentColor: "#f472b6",
    lowercase: true,
    shadow: "glow",
  },
  {
    // Indie vlog / interview typewriter subtitles.
    id: "typewriter",
    label: "typewriter",
    fontKey: "courierPrime",
    textColor: "#ffffff",
    accentColor: "#fbbf24",
    lowercase: true,
    shadow: "soft",
  },
  {
    // Hand-drawn marker for prank/comedy/doodle content.
    id: "marker",
    label: "Marker",
    fontKey: "permanentMarker",
    textColor: "#ffffff",
    accentColor: "#4ade80",
    stroke: true,
    shadow: "soft",
  },
];

export const CAPTION_THEMES: Record<string, CaptionThemeDef> =
  Object.fromEntries(CAPTION_THEME_LIST.map((t) => [t.id, t]));

export const DEFAULT_CAPTION_THEME = "classic";
