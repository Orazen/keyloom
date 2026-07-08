"use client";

import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  FireIcon,
  VolumeHighIcon,
  VolumeMute02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildChart,
  CHART_FILTERS,
  CHART_TAGS,
  type ChartEntry,
  type ChartFilter,
  chartWeekLabel,
} from "@/features/memes/lib/meme-chart";
import { DEFAULT_CAPTION } from "@/features/memes/lib/meme-layout";
import {
  backgroundForTemplate,
  type MemeTemplate,
} from "@/features/memes/lib/memes";

const STRIP_SIZE = 8;

const PASTELS = [
  "#fde7ef",
  "#e3f1fd",
  "#e5f6e9",
  "#efe9fd",
  "#fdf3e3",
  "#e9f7f6",
];

function pastelFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PASTELS[hash % PASTELS.length] as string;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function MemeSurf({
  templates,
  caption,
  onCaptionChange,
  onSelect,
}: {
  templates: MemeTemplate[];
  caption: string;
  onCaptionChange: (next: string) => void;
  onSelect: (t: MemeTemplate) => void;
}) {
  const [filter, setFilter] = useQueryState(
    "tag",
    parseAsStringLiteral(CHART_FILTERS).withDefault("all"),
  );
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  const chart = useMemo(() => buildChart(templates, new Date()), [templates]);
  const weekLabel = useMemo(() => chartWeekLabel(new Date()), []);

  const presentTags = useMemo(
    () =>
      CHART_TAGS.filter((tag) => templates.some((t) => tag.test.test(t.id))),
    [templates],
  );

  const filtered = useMemo(() => {
    const tag = CHART_TAGS.find((t) => t.id === filter);
    return tag ? chart.filter((e) => tag.test.test(e.template.id)) : chart;
  }, [chart, filter]);

  const total = filtered.length;
  const current = total ? mod(index, total) : 0;
  const active = filtered[current];
  const prevEntry = total > 1 ? filtered[mod(current - 1, total)] : undefined;
  const nextEntry = total > 1 ? filtered[mod(current + 1, total)] : undefined;

  const surf = (dir: 1 | -1) => setIndex(current + dir);

  const selectFilter = (next: ChartFilter) => {
    setFilter(next);
    setIndex(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("button")) return;
      const typing =
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t.isContentEditable;
      if (e.key === "Enter") {
        if (active) {
          e.preventDefault();
          onSelect(active.template);
        }
        return;
      }
      if (typing) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        surf(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        surf(1);
      } else if (e.key === "m" || e.key === "M") {
        setMuted((m) => !m);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (templates.length === 0) {
    return (
      <Stage>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="text-lg font-medium tracking-tight">
            No templates yet
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-white/50">
            Upload transparent <code>.webm</code> clips to the{" "}
            <code>memes/</code> folder of your R2 bucket and they'll show up
            here.
          </p>
        </div>
      </Stage>
    );
  }

  return (
    <Stage>
      <header className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Flip through. Sound on.
          </h1>
          <p className="mt-1 text-sm text-white/50">
            One at a time, like it'll actually be seen. Arrow keys to surf.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterPill
            active={filter === "all"}
            onClick={() => selectFilter("all")}
          >
            <HugeiconsIcon icon={FireIcon} size={13} />
            Hot
          </FilterPill>
          {presentTags.map((tag) => (
            <FilterPill
              key={tag.id}
              active={filter === tag.id}
              onClick={() => selectFilter(tag.id)}
            >
              {tag.label}
            </FilterPill>
          ))}
        </div>
      </header>

      {!active ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-white/50">
            Nothing on the chart for this filter.
          </p>
        </div>
      ) : (
        <>
          <div className="relative flex flex-1 items-center justify-center gap-4 pb-16 pt-4 sm:gap-6">
            {prevEntry ? (
              <GhostCard
                entry={prevEntry}
                className="hidden lg:block"
                onClick={() => surf(-1)}
              />
            ) : null}

            <SurfArrow
              icon={ArrowLeft02Icon}
              label="Previous clip"
              side="left"
              disabled={total < 2}
              onClick={() => surf(-1)}
            />

            <ActiveCard
              key={active.template.id}
              entry={active}
              caption={caption}
              muted={muted}
              onToggleMuted={() => setMuted((m) => !m)}
              onAutoplayBlocked={() => setMuted(true)}
              onOpen={() => onSelect(active.template)}
              metaLine={`${active.uses} uses${active.tag ? ` · ${active.tag}` : ""} · ${current + 1} of ${total}`}
            />

            <SurfArrow
              icon={ArrowRight02Icon}
              label="Next clip"
              side="right"
              disabled={total < 2}
              onClick={() => surf(1)}
            />

            {nextEntry ? (
              <div className="relative hidden lg:block">
                <GhostCard entry={nextEntry} onClick={() => surf(1)} />
                <CaptionPanel
                  caption={caption}
                  onCaptionChange={onCaptionChange}
                  onOpen={() => onSelect(active.template)}
                  className="absolute left-1/2 top-1/2 w-64 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            ) : (
              <CaptionPanel
                caption={caption}
                onCaptionChange={onCaptionChange}
                onOpen={() => onSelect(active.template)}
                className="hidden w-64 lg:block"
              />
            )}
          </div>

          <CaptionPanel
            caption={caption}
            onCaptionChange={onCaptionChange}
            onOpen={() => onSelect(active.template)}
            className="mx-auto w-full max-w-sm lg:hidden"
          />

          <footer className="relative mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <div className="flex items-center gap-3 max-sm:justify-center">
              <Hint keys={["←", "→"]} label="surf" />
              <Hint keys={["M"]} label="sound" />
              <Hint keys={["↵"]} label="edit" />
            </div>
            <FilmStrip entries={filtered} current={current} onJump={setIndex} />
            <p className="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-white/35 max-sm:hidden">
              Week of {weekLabel} · refreshes Sundays
            </p>
          </footer>
        </>
      )}
    </Stage>
  );
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex min-h-[calc(100dvh-4.25rem)] flex-col overflow-hidden rounded-3xl bg-[#0e0f13] px-5 py-5 text-white sm:px-8 sm:py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(640px_520px_at_50%_42%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]"
      />
      {children}
    </section>
  );
}

function ActiveCard({
  entry,
  caption,
  muted,
  metaLine,
  onToggleMuted,
  onAutoplayBlocked,
  onOpen,
}: {
  entry: ChartEntry;
  caption: string;
  muted: boolean;
  metaLine: string;
  onToggleMuted: () => void;
  onAutoplayBlocked: () => void;
  onOpen: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const bgSrc = backgroundForTemplate(entry.template.id)?.src;
  const previewCaption = caption.trim() || DEFAULT_CAPTION.text;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {
      if (!muted) onAutoplayBlocked();
    });
  }, [muted, onAutoplayBlocked]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${entry.template.title} in the editor`}
        className="group relative block h-[min(58vh,540px)] cursor-pointer overflow-hidden rounded-[1.75rem] shadow-[0_24px_80px_-24px_color-mix(in_oklab,var(--primary)_45%,transparent)] outline-none ring-1 ring-white/10 transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-primary"
        style={{ aspectRatio: "9 / 16" }}
      >
        {bgSrc ? (
          // biome-ignore lint/performance/noImgElement: local static preview thumbnail
          <img
            src={bgSrc}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundColor: pastelFor(entry.template.id) }}
          />
        )}

        {/* biome-ignore lint/a11y/useMediaCaption: meme template preview, no caption track */}
        <video
          ref={videoRef}
          src={entry.template.src}
          autoPlay
          loop
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (barRef.current && v.duration) {
              barRef.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
            }
          }}
          className="absolute inset-0 size-full object-contain"
        />

        <p
          className="absolute inset-x-[6%] top-[12%] text-center text-[clamp(14px,1.9vh,20px)] font-extrabold leading-snug text-white [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000,0_2px_0_#000,0_-2px_0_#000,2px_0_0_#000,-2px_0_0_#000]"
          style={{ fontFamily: "'TikTok Sans', sans-serif" }}
        >
          {previewCaption}
        </p>

        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
          <HugeiconsIcon icon={FireIcon} size={11} />#{entry.rank} this week
        </span>

        {duration ? (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 font-mono text-[10px] tabular-nums text-white/80">
            {formatDuration(duration)}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div ref={barRef} className="h-full w-0 bg-primary" />
        </div>
      </button>

      <button
        type="button"
        onClick={onToggleMuted}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute -right-2 bottom-14 z-10 flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <HugeiconsIcon
          icon={muted ? VolumeMute02Icon : VolumeHighIcon}
          size={16}
        />
      </button>

      <div className="pointer-events-none absolute left-1/2 top-full mt-3 w-[150%] -translate-x-1/2 text-center">
        <h2 className="truncate font-heading text-lg font-semibold tracking-tight">
          {entry.template.title}
        </h2>
        <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          {metaLine}
        </p>
      </div>
    </div>
  );
}

function GhostCard({
  entry,
  onClick,
  className,
}: {
  entry: ChartEntry;
  onClick: () => void;
  className?: string;
}) {
  const bgSrc = backgroundForTemplate(entry.template.id)?.src;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Surf to ${entry.template.title}`}
      className={cn(
        "relative h-[min(42vh,380px)] shrink-0 overflow-hidden rounded-3xl ring-1 ring-white/5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      style={{ aspectRatio: "9 / 16" }}
    >
      {bgSrc ? (
        // biome-ignore lint/performance/noImgElement: local static preview thumbnail
        <img
          src={bgSrc}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-20 saturate-50"
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center px-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
        {entry.template.title}
      </span>
    </button>
  );
}

function CaptionPanel({
  caption,
  onCaptionChange,
  onOpen,
  className,
}: {
  caption: string;
  onCaptionChange: (next: string) => void;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#15171d]/95 p-4 shadow-2xl",
        className,
      )}
    >
      <label
        htmlFor="surf-caption"
        className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40"
      >
        Your caption — rides every flip
      </label>
      <Input
        id="surf-caption"
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder={DEFAULT_CAPTION.text}
        className="border-white/10 bg-white/5 text-[13px] text-white placeholder:text-white/25"
      />
      <Button className="w-full rounded-full" onClick={onOpen}>
        Open in editor
        <HugeiconsIcon icon={ArrowRight02Icon} size={15} />
      </Button>
    </div>
  );
}

function SurfArrow({
  icon,
  label,
  side,
  disabled,
  onClick,
}: {
  icon: typeof ArrowLeft02Icon;
  label: string;
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/15 hover:text-white max-sm:absolute max-sm:top-1/2 max-sm:z-10 max-sm:-translate-y-1/2",
        side === "left" ? "max-sm:left-0" : "max-sm:right-0",
      )}
    >
      <HugeiconsIcon icon={icon} size={16} />
    </Button>
  );
}

function FilmStrip({
  entries,
  current,
  onJump,
}: {
  entries: ChartEntry[];
  current: number;
  onJump: (index: number) => void;
}) {
  const start = Math.min(
    Math.max(0, current - 3),
    Math.max(0, entries.length - STRIP_SIZE),
  );
  const visible = entries.slice(start, start + STRIP_SIZE);
  const overflow = entries.length - (start + visible.length);

  return (
    <div className="flex items-center justify-center gap-1.5">
      {visible.map((entry, i) => {
        const index = start + i;
        const bgSrc = backgroundForTemplate(entry.template.id)?.src;
        const isActive = index === current;
        return (
          <button
            key={entry.template.id}
            type="button"
            onClick={() => onJump(index)}
            aria-label={`Jump to ${entry.template.title}`}
            aria-current={isActive}
            className={cn(
              "relative h-14 w-9 shrink-0 overflow-hidden rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "ring-2 ring-primary"
                : "opacity-40 ring-1 ring-white/10 hover:opacity-70",
            )}
          >
            {bgSrc ? (
              // biome-ignore lint/performance/noImgElement: local static preview thumbnail
              <img
                src={bgSrc}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundColor: pastelFor(entry.template.id) }}
              />
            )}
          </button>
        );
      })}
      {overflow > 0 ? (
        <button
          type="button"
          onClick={() => onJump(start + STRIP_SIZE)}
          aria-label={`${overflow} more clips`}
          className="flex h-14 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-[10px] text-white/50 ring-1 ring-white/10 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          +{overflow}
        </button>
      ) : null}
    </div>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
      {keys.map((k) => (
        <kbd
          key={k}
          className="flex h-5 min-w-5 items-center justify-center rounded border border-white/15 px-1 font-mono text-[10px] text-white/60"
        >
          {k}
        </kbd>
      ))}
      {label}
    </span>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-white text-zinc-900"
          : "text-white/55 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
