export type FilterPreset = {
  id: string;
  label: string;
  /** CSS filter string applied to the source video; undefined = untouched. */
  css?: string;
};

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "none", label: "No filter" },
  { id: "vivid", label: "Vivid", css: "saturate(1.45) contrast(1.1)" },
  {
    id: "warm",
    label: "Warm",
    css: "brightness(1.05) saturate(1.15) sepia(0.18)",
  },
  {
    id: "cool",
    label: "Cool",
    css: "brightness(1.03) saturate(1.08) hue-rotate(-10deg)",
  },
  { id: "mono", label: "B&W", css: "grayscale(1) contrast(1.08)" },
  {
    id: "vintage",
    label: "Vintage",
    css: "sepia(0.35) contrast(0.95) brightness(1.02) saturate(0.85)",
  },
  {
    id: "faded",
    label: "Faded",
    css: "brightness(1.1) contrast(0.88) saturate(0.8)",
  },
];

export const FILTERS_BY_ID: Record<string, FilterPreset> = Object.fromEntries(
  FILTER_PRESETS.map((f) => [f.id, f]),
);
