"use client";

import {
  Delete02Icon,
  PencilEdit02Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { TimeRange } from "@workspace/compositions/compositions/CaptionedVideo/timeline";
import { isKept } from "@workspace/compositions/compositions/CaptionedVideo/timeline";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { memo, useEffect, useRef, useState } from "react";
import { formatRange, type Segment, segmentRange } from "../lib/editor";

export function SegmentsPanel({
  segments,
  keeps,
  playheadOriginal,
  onSeek,
  onEdit,
  onToggleHidden,
  onDelete,
}: {
  segments: Segment[];
  keeps: TimeRange[];
  playheadOriginal: number;
  onSeek: (t: number) => void;
  onEdit: (id: string, text: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const activeId =
    segments.find((s) => {
      const r = segmentRange(s);
      return playheadOriginal >= r.start && playheadOriginal < r.end;
    })?.id ?? null;

  const wordCount = segments.reduce((sum, s) => sum + s.words.length, 0);

  return (
    <aside className="flex min-h-0 w-full flex-col rounded-2xl border border-border bg-card shadow-sm lg:w-[380px] lg:shrink-0">
      <header className="flex items-baseline justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Captions</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {wordCount} words · {segments.length} lines
        </span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {segments.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Every caption line was deleted. Upload the video again to start
            over.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {segments.map((seg) => (
              <SegmentRow
                key={seg.id}
                segment={seg}
                keeps={keeps}
                active={seg.id === activeId}
                playheadOriginal={seg.id === activeId ? playheadOriginal : -1}
                onSeek={onSeek}
                onEdit={onEdit}
                onToggleHidden={onToggleHidden}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

const SegmentRow = memo(function SegmentRow({
  segment,
  keeps,
  active,
  playheadOriginal,
  onSeek,
  onEdit,
  onToggleHidden,
  onDelete,
}: {
  segment: Segment;
  keeps: TimeRange[];
  active: boolean;
  playheadOriginal: number;
  onSeek: (t: number) => void;
  onEdit: (id: string, text: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const rowRef = useRef<HTMLLIElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const range = segmentRange(segment);
  const fullyCut = !segment.words.some((w) =>
    isKept((w.start + w.end) / 2, keeps),
  );

  useEffect(() => {
    if (active && !editing) {
      rowRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [active, editing]);

  const commit = () => {
    setEditing(false);
    const text = draft.trim();
    if (text !== segment.words.map((w) => w.text).join(" ")) {
      onEdit(segment.id, text);
    }
  };

  return (
    <li
      ref={rowRef}
      className={cn(
        "group relative rounded-lg px-3 py-2 transition-colors",
        active ? "bg-accent" : "hover:bg-accent/50",
        (segment.hidden || fullyCut) && "opacity-50",
      )}
    >
      {active ? (
        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSeek(range.start)}
          className="font-mono text-[10px] tabular-nums text-muted-foreground hover:text-foreground"
        >
          {formatRange(range)}
          {fullyCut ? " · cut" : segment.hidden ? " · hidden" : ""}
        </button>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <RowAction
            label="Edit text"
            onClick={() => {
              setDraft(segment.words.map((w) => w.text).join(" "));
              setEditing(true);
            }}
          >
            <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
          </RowAction>
          <RowAction
            label={segment.hidden ? "Show on video" : "Hide from video"}
            onClick={() => onToggleHidden(segment.id)}
          >
            <HugeiconsIcon
              icon={segment.hidden ? ViewOffSlashIcon : ViewIcon}
              size={14}
            />
          </RowAction>
          <RowAction label="Delete line" onClick={() => onDelete(segment.id)}>
            <HugeiconsIcon icon={Delete02Icon} size={14} />
          </RowAction>
        </div>
      </div>
      {editing ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="mt-1 h-8 text-sm"
        />
      ) : (
        <button
          type="button"
          onClick={() => onSeek(range.start)}
          className="mt-0.5 w-full text-left text-sm leading-snug"
        >
          {segment.words.map((w, i) => {
            const mid = (w.start + w.end) / 2;
            const cut = !isKept(mid, keeps);
            const speaking =
              playheadOriginal >= w.start && playheadOriginal < w.end;
            return (
              <span
                key={`${w.start}-${w.end}-${w.text}`}
                className={cn(
                  cut && "line-through opacity-40",
                  speaking && "font-semibold text-primary",
                )}
              >
                {w.text}
                {i < segment.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </button>
      )}
    </li>
  );
});

function RowAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
