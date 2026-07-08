"use client";

import {
  ArrowDown01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo, useRef, useState } from "react";
import {
  buildChart,
  CHART_FILTERS,
  CHART_TAGS,
  type ChartEntry,
  type ChartFilter,
  chartWeekLabel,
} from "@/features/memes/lib/meme-chart";
import {
  backgroundForTemplate,
  type MemeTemplate,
} from "@/features/memes/lib/memes";

const COLLAPSED_ROWS = 7;

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

export function MemeChart({
  templates,
  onSelect,
}: {
  templates: MemeTemplate[];
  onSelect: (t: MemeTemplate) => void;
}) {
  const [filter, setFilter] = useQueryState(
    "tag",
    parseAsStringLiteral(CHART_FILTERS).withDefault("all"),
  );
  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [expanded, setExpanded] = useState(false);

  const chart = useMemo(() => buildChart(templates, new Date()), [templates]);
  const weekLabel = useMemo(() => chartWeekLabel(new Date()), []);

  const presentTags = useMemo(
    () =>
      CHART_TAGS.filter((tag) => templates.some((t) => tag.test.test(t.id))),
    [templates],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tag = CHART_TAGS.find((t) => t.id === filter);
    return chart.filter((e) => {
      if (tag && !tag.test.test(e.template.id)) return false;
      if (!q) return true;
      return e.template.title.toLowerCase().includes(q);
    });
  }, [chart, filter, query]);

  const [hero, ...rest] = filtered;
  const rows = expanded ? rest : rest.slice(0, COLLAPSED_ROWS);
  const hidden = rest.length - rows.length;

  const selectFilter = (next: ChartFilter) => {
    setFilter(next);
    setExpanded(false);
  };

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
        <h2 className="text-lg font-medium tracking-tight">No templates yet</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Upload transparent <code>.webm</code> clips to the <code>memes/</code>{" "}
          folder of your R2 bucket and they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Week of {weekLabel} · refreshes Sundays
          </p>
          <h1 className="mt-1.5 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            This week in memes
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <FilterPill
            label={`Hot ${chart.length}`}
            active={filter === "all"}
            onClick={() => selectFilter("all")}
          />
          {presentTags.map((tag) => (
            <FilterPill
              key={tag.id}
              label={tag.label}
              active={filter === tag.id}
              onClick={() => selectFilter(tag.id)}
            />
          ))}
          <div className="relative ml-1">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setExpanded(false);
              }}
              placeholder="Search..."
              className="h-8 w-36 rounded-full pl-8 text-[13px] sm:w-44"
            />
          </div>
        </div>
      </div>

      {!hero ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No templates match “{query}”.
        </p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <ChartHero entry={hero} onSelect={onSelect} />

          <div className="flex flex-col">
            {rows.map((entry) => (
              <ChartRow
                key={entry.template.id}
                entry={entry}
                onSelect={onSelect}
              />
            ))}

            {hidden > 0 ? (
              <div className="mt-2 flex items-center justify-between px-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {hidden} more on the chart
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[13px]"
                  onClick={() => setExpanded(true)}
                >
                  See ranks {rows.length + 2}–{filtered.length}
                  <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
                </Button>
              </div>
            ) : expanded && rest.length > COLLAPSED_ROWS ? (
              <div className="mt-2 flex justify-end px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[13px]"
                  onClick={() => setExpanded(false)}
                >
                  Show top {COLLAPSED_ROWS + 1}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartHero({
  entry,
  onSelect,
}: {
  entry: ChartEntry;
  onSelect: (t: MemeTemplate) => void;
}) {
  const bgSrc = backgroundForTemplate(entry.template.id)?.src;

  return (
    <section className="relative aspect-[9/15] w-full max-w-[360px] overflow-hidden rounded-3xl bg-muted/40 lg:sticky lg:top-6">
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
          className="absolute inset-0 dark:opacity-15"
          style={{ backgroundColor: pastelFor(entry.template.id) }}
        />
      )}

      <video
        src={entry.template.src}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 size-full object-contain"
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-14">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            {entry.template.title}
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
            {entry.uses} uses{entry.tag ? ` · ${entry.tag}` : ""}
          </p>
        </div>
        <Button
          className="w-full rounded-full"
          onClick={() => onSelect(entry.template)}
        >
          Use this template
          <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
        </Button>
      </div>
    </section>
  );
}

function ChartRow({
  entry,
  onSelect,
}: {
  entry: ChartEntry;
  onSelect: (t: MemeTemplate) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgSrc = backgroundForTemplate(entry.template.id)?.src;

  const play = () => {
    videoRef.current?.play().catch(() => {});
  };
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-accent/50 sm:gap-4 sm:px-3"
      onClick={() => onSelect(entry.template)}
      onMouseEnter={play}
      onMouseLeave={stop}
    >
      <span className="w-7 shrink-0 text-right font-heading text-xl font-semibold tabular-nums">
        {entry.rank}
      </span>

      <Movement entry={entry} />

      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-muted/40">
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
            className="absolute inset-0 dark:opacity-15"
            style={{ backgroundColor: pastelFor(entry.template.id) }}
          />
        )}
        <video
          ref={videoRef}
          src={entry.template.src}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-tight">
          {entry.template.title}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {entry.uses} uses{entry.tag ? ` · ${entry.tag}` : ""}
        </p>
      </div>

      <Sparkline values={entry.sparkline} />

      <Button
        variant="outline"
        size="sm"
        className="rounded-full opacity-0 transition-opacity group-hover:opacity-100 max-sm:hidden"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(entry.template);
        }}
      >
        Use
        <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
      </Button>
    </div>
  );
}

function Movement({ entry }: { entry: ChartEntry }) {
  if (entry.isNew) {
    return (
      <span className="w-8 shrink-0 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-primary">
        New
      </span>
    );
  }
  if (entry.delta === 0) {
    return (
      <span className="w-8 shrink-0 text-center font-mono text-[11px] text-muted-foreground">
        —
      </span>
    );
  }
  const up = entry.delta > 0;
  return (
    <span
      className={cn(
        "flex w-8 shrink-0 items-center justify-center font-mono text-[11px]",
        up ? "text-emerald-600" : "text-red-500",
      )}
    >
      <HugeiconsIcon icon={up ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
      {Math.abs(entry.delta)}
    </span>
  );
}

function Sparkline({ values }: { values: number[] }) {
  return (
    <div
      className="hidden h-8 shrink-0 items-end gap-[3px] sm:flex"
      aria-hidden
    >
      {values.map((v, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static series
          key={i}
          className={cn(
            "w-[3px] rounded-full",
            i === values.length - 1 ? "bg-primary" : "bg-border",
          )}
          style={{ height: `${Math.round(v * 100)}%` }}
        />
      ))}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
