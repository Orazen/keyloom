"use client";

import { TextFontIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import type { CaptionStyle } from "./caption-editor";

const WORD_OPTIONS: { label: string; value: number }[] = [
  { label: "1 word", value: 1 },
  { label: "2 words", value: 2 },
  { label: "3 words", value: 3 },
  { label: "4 words", value: 4 },
  { label: "5 words", value: 5 },
];

export function StyleToolbar({
  style,
  onStyle,
}: {
  style: CaptionStyle;
  onStyle: (patch: Partial<CaptionStyle>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ThemePicker style={style} onStyle={onStyle} />

      <Select
        value={style.fontKey}
        onValueChange={(v) => onStyle({ fontKey: v as FontKey })}
      >
        <SelectTrigger size="sm" className="w-40 gap-2">
          <HugeiconsIcon
            icon={TextFontIcon}
            size={14}
            className="text-muted-foreground"
          />
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

      <Select
        value={String(style.wordsPerCaption)}
        onValueChange={(v) => onStyle({ wordsPerCaption: Number(v) })}
      >
        <SelectTrigger size="sm" className="w-28">
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

      <ColorSwatch
        label="Text color"
        value={style.textColor}
        onChange={(v) => onStyle({ textColor: v })}
      />
      <ColorSwatch
        label="Highlight color"
        value={style.accentColor}
        onChange={(v) => onStyle({ accentColor: v })}
      />
    </div>
  );
}

function ThemePicker({
  style,
  onStyle,
}: {
  style: CaptionStyle;
  onStyle: (patch: Partial<CaptionStyle>) => void;
}) {
  const current =
    CAPTION_THEME_LIST.find((t) => t.id === style.themeId) ??
    CAPTION_THEME_LIST[0]!;
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <ThemeSwatch theme={current} />
              {current.label}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Caption theme</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-72 p-2" align="start">
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
      </PopoverContent>
    </Popover>
  );
}

// Mirrors TikTokCaption's word styling at thumbnail scale — same weight,
// proportional stroke, the renderer's shadow formulas, and the accent chip /
// line pill — so picking a theme gives exactly what the tile shows.
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

function ThemeSwatch({ theme }: { theme: CaptionThemeDef }) {
  return (
    <span
      className="flex h-4 w-6 items-center justify-center rounded-sm text-[8px] font-bold leading-none"
      style={{
        backgroundColor:
          theme.phraseBackground ?? theme.lineBackground ?? "#3f3f46",
        color: theme.hollow ? "transparent" : theme.textColor,
        WebkitTextStroke: theme.hollow ? `0.5px ${theme.textColor}` : undefined,
        fontFamily: FONTS[theme.fontKey].cssFamily,
      }}
    >
      Aa
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
    <Tooltip>
      <TooltipTrigger asChild>
        <label className="relative flex size-8 cursor-pointer items-center justify-center rounded-md border border-input shadow-xs transition-colors hover:bg-accent">
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
        </label>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
