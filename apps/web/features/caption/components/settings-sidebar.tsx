"use client";

import {
  ArrowLeft02Icon,
  ArrowRight01Icon,
  PaintBoardIcon,
  SubtitleIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FONTS } from "@workspace/compositions/compositions/TikTokCaption/config";
import { CAPTION_THEME_LIST } from "@workspace/compositions/compositions/TikTokCaption/themes";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";
import type { Segment } from "../lib/editor";
import type { CaptionStyle } from "./caption-editor";
import { SegmentsPanel } from "./segments-panel";
import { TextPanel, ThemePanel } from "./style-panel";

type View = "root" | "theme" | "text" | "captions";

export function SettingsSidebar({
  style,
  onStyle,
  segments,
  playhead,
  onSeek,
  onEditSegment,
  onToggleHidden,
  onDeleteSegment,
}: {
  style: CaptionStyle;
  onStyle: (patch: Partial<CaptionStyle>) => void;
  segments: Segment[];
  playhead: number;
  onSeek: (t: number) => void;
  onEditSegment: (id: string, text: string) => void;
  onToggleHidden: (id: string) => void;
  onDeleteSegment: (id: string) => void;
}) {
  const [view, setView] = useState<View>("root");
  const themeLabel =
    CAPTION_THEME_LIST.find((t) => t.id === style.themeId)?.label ?? "Custom";
  const wordCount = segments.reduce((sum, s) => sum + s.words.length, 0);

  if (view === "theme") {
    return (
      <SubPanel title="Caption theme" onBack={() => setView("root")}>
        <ThemePanel style={style} onStyle={onStyle} />
      </SubPanel>
    );
  }

  if (view === "text") {
    return (
      <SubPanel title="Text & font" onBack={() => setView("root")}>
        <TextPanel style={style} onStyle={onStyle} />
      </SubPanel>
    );
  }

  if (view === "captions") {
    return (
      <SubPanel
        title="Edit captions"
        meta={`${wordCount} words · ${segments.length} lines`}
        onBack={() => setView("root")}
      >
        <SegmentsPanel
          segments={segments}
          playhead={playhead}
          onSeek={onSeek}
          onEdit={onEditSegment}
          onToggleHidden={onToggleHidden}
          onDelete={onDeleteSegment}
        />
      </SubPanel>
    );
  }

  return (
    <section className="animate-in fade-in slide-in-from-left-2 rounded-2xl border border-border bg-card shadow-sm duration-200">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Edit</h2>
      </header>
      <div className="flex flex-col gap-1 p-2">
        <MenuRow
          icon={PaintBoardIcon}
          title="Caption theme"
          description="Pick a ready-made caption look"
          value={themeLabel}
          onClick={() => setView("theme")}
        />
        <MenuRow
          icon={TextFontIcon}
          title="Text & font"
          description="Font, words at a time & colors"
          value={FONTS[style.fontKey].label}
          onClick={() => setView("text")}
        />
        <MenuRow
          icon={SubtitleIcon}
          title="Edit captions"
          description="Fix or hide caption lines"
          value={`${segments.length} lines`}
          onClick={() => setView("captions")}
        />
      </div>
    </section>
  );
}

function MenuRow({
  icon,
  title,
  description,
  value,
  onClick,
}: {
  icon: typeof PaintBoardIcon;
  title: string;
  description: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        <HugeiconsIcon icon={icon} size={17} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      {value ? (
        <span className="max-w-24 truncate text-xs text-muted-foreground">
          {value}
        </span>
      ) : null}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={16}
        className="shrink-0 text-muted-foreground"
      />
    </button>
  );
}

function SubPanel({
  title,
  meta,
  onBack,
  children,
}: {
  title: string;
  meta?: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-in fade-in slide-in-from-right-2 flex min-h-0 flex-col rounded-2xl border border-border bg-card shadow-sm duration-200">
      <header className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={onBack}
          aria-label="Back"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
        </Button>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {meta ? (
          <span className="ml-auto text-[11px] text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </header>
      <div className="min-h-0 overflow-y-auto">{children}</div>
    </section>
  );
}
