"use client";

import { TextFontIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FONT_KEYS,
  FONTS,
  type FontKey,
} from "@workspace/compositions/compositions/TikTokCaption/config";
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
                  "flex h-12 items-center justify-center rounded-lg border transition-colors",
                  active
                    ? "border-primary/60 ring-1 ring-primary/40"
                    : "border-transparent hover:border-border",
                )}
                style={{ backgroundColor: "#3f3f46" }}
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

function ThemePreviewText({ theme }: { theme: CaptionThemeDef }) {
  const chipBackground = theme.phraseBackground ?? theme.lineBackground;
  return (
    <span
      className="px-1.5 text-[13px] leading-none"
      style={{
        fontFamily: FONTS[theme.fontKey].cssFamily,
        fontWeight: 700,
        color: theme.hollow ? "transparent" : theme.textColor,
        WebkitTextStroke: theme.stroke
          ? `1px ${theme.hollow ? theme.textColor : "#000"}`
          : undefined,
        paintOrder: "stroke fill",
        textTransform: theme.uppercase
          ? "uppercase"
          : theme.lowercase
            ? "lowercase"
            : undefined,
        fontStyle: theme.italic ? "italic" : undefined,
        textShadow:
          theme.shadow === "glow"
            ? `0 0 6px ${theme.accentColor}, 0 0 14px ${theme.accentColor}`
            : theme.shadow === "none"
              ? undefined
              : "0 1px 3px rgba(0,0,0,0.7)",
        ...(chipBackground
          ? {
              background: chipBackground,
              borderRadius: 5,
              padding: "3px 8px",
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
