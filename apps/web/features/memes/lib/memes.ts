import { cdnAsset } from "@/lib/cdn";

export const memeAsset = cdnAsset;

export type MemeTemplate = {
  id: string;
  title: string;
  /** Transparent WebM (VP9 alpha). Absolute CDN URL. */
  src: string;
  width: number;
  height: number;
  /** Whether the clip carries an audio track worth keeping on export. */
  hasAudio?: boolean;
};

export type MemeBackground = {
  id: string;
  title: string;
  /** Absolute CDN URL to a still image. */
  src: string;
};

/** Replace/extend with your real uploads. ids must be unique + stable. */
export const memeTemplates: MemeTemplate[] = [
  {
    id: "aww",
    title: "Aww",
    src: memeAsset("memes/aww_transparent.webm"),
    // native size of the clip — used only for default framing math; the meme
    // output is always 9:16 (see OUTPUT_WIDTH/HEIGHT in the editor).
    width: 1354,
    height: 1080,
    hasAudio: false,
  },
];

/**
 * Curated backgrounds, served from apps/web/public/backgrounds (shared with the
 * remotion app via symlink). The first entry is the editor's default. Users can
 * still upload their own; ids must be unique + stable.
 */
export const memeBackgrounds: MemeBackground[] = [
  { id: "grocery", title: "Grocery", src: "/backgrounds/grocery.jpg" },
  { id: "park", title: "Park", src: "/backgrounds/park.jpg" },
  { id: "kitchen", title: "Kitchen", src: "/backgrounds/kitchen.jpg" },
  { id: "office", title: "Office", src: "/backgrounds/bg1.jpg" },
  { id: "studio", title: "Studio", src: "/backgrounds/bg2.jpg" },
  { id: "classroom", title: "Classroom", src: "/backgrounds/bg3.jpg" },
];

/**
 * Pick a background for a template deterministically from its id, so each
 * template consistently gets its own backdrop (instead of every card sharing
 * `memeBackgrounds[0]`) — both in the gallery preview and as the editor default.
 */
export function backgroundForTemplate(id: string): MemeBackground | undefined {
  if (memeBackgrounds.length === 0) return undefined;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return memeBackgrounds[hash % memeBackgrounds.length];
}
