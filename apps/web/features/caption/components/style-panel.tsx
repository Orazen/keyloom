"use client";

import {
  FONT_KEYS,
  FONTS,
  type FontKey,
} from "@workspace/compositions/compositions/TikTokCaption/config";
import { WEIGHT_BY_FONT } from "@workspace/compositions/compositions/TikTokCaption/TikTokCaption";
import {
  CAPTION_THEME_LIST,
  type CaptionThemeDef,
} from "@workspace/compositions/compositions/TikTokCaption/themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { FILTER_PRESETS } from "../lib/filters";
import type { CaptionStyle } from "./caption-editor";

const WORD_OPTIONS: { label: string; value: number }[] = [
  { label: "1 word", value: 1 },
  { label: "2 words", value: 2 },
  { label: "3 words", value: 3 },
  { label: "4 words", value: 4 },
  { label: "5 words", value: 5 },
];

export function StylePanel({
  style,
  onStyle,
}: {
  style: CaptionStyle;
  onStyle: (patch: Partial<CaptionStyle>) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Style</h2>
      </header>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-1.5">
          {CAPTION_THEME_LIST.map((t) => {
            const active = t.id === style.themeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  onStyle({
                    themeId: t.id,
                    fontKey: t.fontKey,
                    textColor: t.textColor,
                    accentColor: t.accentColor,
                  })
                }
                className={cn(
                  "flex h-14 items-center justify-center overflow-hidden rounded-lg border transition-colors",
                  active
                    ? "border-primary/60 ring-1 ring-primary/40"
                    : "border-transparent hover:border-border",
                )}
                style={{ backgroundColor: "#1c1c21" }}
                aria-label={`Theme ${t.label}`}
              >
                <ThemePreviewText theme={t} />
              </button>
            );
          })}
        </div>

        <LabeledControl label="Font">
          <Select
            value={style.fontKey}
            onValueChange={(v) => onStyle({ fontKey: v as FontKey })}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  <span style={{ fontFamily: FONTS[key].cssFamily }}>
                    {FONTS[key].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </LabeledControl>

        <div className="grid grid-cols-2 gap-3">
          <LabeledControl label="Words at a time">
            <Select
              value={String(style.wordsPerCaption)}
              onValueChange={(v) => onStyle({ wordsPerCaption: Number(v) })}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORD_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={String(w.value)}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledControl>

          <LabeledControl label="Filter">
            <Select
              value={style.filterId}
              onValueChange={(v) => onStyle({ filterId: v })}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_PRESETS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledControl>
        </div>

        <div className="flex items-center gap-4">
          <ColorSwatch
            label="Text"
            value={style.textColor}
            onChange={(v) => onStyle({ textColor: v })}
          />
          <ColorSwatch
            label="Highlight"
            value={style.accentColor}
            onChange={(v) => onStyle({ accentColor: v })}
          />
        </div>
      </div>
    </section>
  );
}

function LabeledControl({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

// Mirrors TikTokCaption's word styling at thumbnail scale — same weight,
// proportional stroke, the renderer's shadow formulas, and the accent chip /
// line pill / phrase box treatments — so picking a theme gives exactly what
// the tile shows.
function ThemePreviewText({ theme }: { theme: CaptionThemeDef }) {
  const fs = 15;
  const chip = Boolean(theme.activeWordBackground);
  const pill = theme.phraseBackground ?? theme.lineBackground;
  const shadow =
    theme.shadow === "none"
      ? undefined
      : theme.shadow === "glow"
        ? `0 0 ${fs * 0.14}px ${theme.accentColor}, 0 0 ${fs * 0.4}px ${theme.accentColor}, 0 ${fs * 0.02}px ${fs * 0.05}px rgba(0,0,0,0.6)`
        : theme.shadow === "heavy"
          ? `0 ${fs * 0.05}px ${fs * 0.1}px rgba(0,0,0,0.85), 0 ${fs * 0.12}px ${fs * 0.3}px rgba(0,0,0,0.5)`
          : `0 ${fs * 0.04}px ${fs * 0.1}px rgba(0,0,0,0.6)`;
  return (
    <span
      style={{
        fontFamily: FONTS[theme.fontKey].cssFamily,
        fontWeight: WEIGHT_BY_FONT[theme.fontKey] ?? 800,
        fontSize: fs,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
        textTransform: theme.uppercase
          ? "uppercase"
          : theme.lowercase
            ? "lowercase"
            : undefined,
        fontStyle: theme.italic ? "italic" : undefined,
        color: theme.hollow ? "transparent" : theme.textColor,
        WebkitTextStroke: theme.stroke
          ? `${Math.max(1, fs * 0.06)}px ${theme.hollow ? theme.textColor : "#000"}`
          : undefined,
        paintOrder: "stroke fill",
        textShadow: shadow,
        ...(chip
          ? {
              background: theme.accentColor,
              borderRadius: fs * 0.16,
              padding: `${fs * 0.12}px ${fs * 0.3}px`,
            }
          : pill
            ? {
                background: pill,
                borderRadius: fs * 0.22,
                padding: `${fs * 0.08}px ${fs * 0.26}px`,
              }
            : {}),
        ...(theme.textImage
          ? {
              backgroundImage: `url(/${theme.textImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center 40%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: undefined,
              filter: "brightness(1.35) saturate(1.4)",
            }
          : {}),
      }}
    >
      {theme.label}
    </span>
  );
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <span className="relative flex size-8 items-center justify-center rounded-md border border-input shadow-xs transition-colors hover:bg-accent">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={label}
        />
        <span
          className="size-4 rounded-full border border-border/60"
          style={{ backgroundColor: value }}
        />
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </label>
  );
}
