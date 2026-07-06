"use client";

import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  compositionModulePath,
  compositions,
} from "@workspace/compositions/registry";
import type {
  AnyCompositionInfo,
  CompositionCategory,
} from "@workspace/compositions/schema";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as React from "react";

const LivePreview = dynamic(
  () => import("./live-preview").then((m) => m.LivePreview),
  { ssr: false },
);

const CATEGORY_LABELS: Record<CompositionCategory, string> = {
  text: "Text",
  social: "Social Media",
  data: "Charts & Data",
  devtools: "Dev Tools",
  marketing: "Marketing",
  layout: "Frames & Mockups",
  captions: "Captions",
  media: "Media",
  background: "Backgrounds",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as CompositionCategory[];

const CATEGORY_DOTS: Record<CompositionCategory, string> = {
  text: "#8b5cf6",
  social: "#ec4899",
  data: "#06b6d4",
  devtools: "#22c55e",
  marketing: "#f59e0b",
  layout: "#64748b",
  captions: "#f43f5e",
  media: "#3b82f6",
  background: "#a1a1aa",
};

type Filter = "all" | CompositionCategory;

const VISIBLE_COMPOSITIONS = compositions.filter(
  (c) => c.category !== "background",
);

const DROP_SIZE = 6;
const NEWEST = VISIBLE_COMPOSITIONS.slice(-DROP_SIZE).reverse();

const PRESENT_CATEGORIES = CATEGORY_ORDER.filter((c) =>
  VISIBLE_COMPOSITIONS.some((comp) => comp.category === c),
);

const COUNT_BY_CATEGORY = VISIBLE_COMPOSITIONS.reduce((counts, c) => {
  counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  return counts;
}, new Map<CompositionCategory, number>());

export function GalleryBrowser() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return VISIBLE_COMPOSITIONS.filter((c) => {
      if (filter !== "all" && c.category !== filter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  return (
    <div className="space-y-6">
      <DropBanner />
      <div className="sticky top-14 z-30 -mx-5 border-b border-dashed border-border bg-background/95 px-5 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search components..."
                  className="h-8 pl-9 text-[13px]"
                />
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={15} />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Search components"
                className="shrink-0"
                onClick={() => setSearchOpen(true)}
              >
                <HugeiconsIcon icon={Search01Icon} size={15} />
              </Button>
              <div className="h-5 w-px shrink-0 bg-border" />
              <nav className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <CategoryTab
                  label="All"
                  count={VISIBLE_COMPOSITIONS.length}
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                />
                {PRESENT_CATEGORIES.map((c) => (
                  <CategoryTab
                    key={c}
                    label={CATEGORY_LABELS[c]}
                    dot={CATEGORY_DOTS[c]}
                    count={COUNT_BY_CATEGORY.get(c) ?? 0}
                    active={filter === c}
                    onClick={() => setFilter(c)}
                  />
                ))}
              </nav>
            </>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No components match “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((info) => (
            <GalleryCard key={info.id} info={info} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryTab({
  label,
  count,
  dot,
  active,
  onClick,
}: {
  label: string;
  count: number;
  dot?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {dot ? (
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />
      ) : null}
      {label}
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums",
          active ? "text-background/60" : "text-muted-foreground/60",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function DropBanner() {
  const featured = NEWEST[0];
  if (!featured) return null;

  const names = NEWEST.slice(0, 3)
    .map((c) => c.title)
    .join(", ");
  const aspect = featured.width / featured.height;
  const previewHeight = aspect >= 1 ? 168 : 220;

  return (
    <section className="flex items-center justify-between gap-8 overflow-hidden rounded-2xl bg-[#0e0e12] p-6 text-white sm:p-8">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          Latest drop
        </p>
        <h2 className="mt-2 text-pretty font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {NEWEST.length} new scenes just landed.
        </h2>
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-white/60">
          {names} and more — fresh off the loom.
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link href={`/studio?component=${featured.id}`} prefetch={false}>
            Open in Studio
          </Link>
        </Button>
      </div>

      <div
        className="hidden shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 md:block"
        style={{ height: previewHeight, aspectRatio: `${aspect}` }}
      >
        <LivePreview
          modulePath={compositionModulePath(featured)}
          id={featured.id}
          defaultProps={featured.defaultProps}
          durationInFrames={featured.durationInFrames}
          fps={featured.fps}
          width={featured.width}
          height={featured.height}
        />
      </div>
    </section>
  );
}

function formatAspect(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(width, height);
  const rw = width / g;
  const rh = height / g;
  if (rw > 32 || rh > 32) return `${width}×${height}`;
  return `${rw}:${rh}`;
}

function formatTimecode(frames: number, fps: number): string {
  const totalSeconds = Math.round(frames / fps);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function GalleryCard({ info }: { info: AnyCompositionInfo }) {
  const ref = React.useRef<HTMLAnchorElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const compAspect = info.width / info.height;

  return (
    <Link
      ref={ref}
      href={`/studio?component=${info.id}`}
      prefetch={false}
      className="group block"
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border/50 transition-all duration-200 group-hover:ring-border group-hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]"
        style={{ aspectRatio: `${compAspect}` }}
      >
        <div className="absolute inset-0">
          {visible ? (
            <LivePreview
              modulePath={compositionModulePath(info)}
              id={info.id}
              defaultProps={info.defaultProps}
              durationInFrames={info.durationInFrames}
              fps={info.fps}
              width={info.width}
              height={info.height}
            />
          ) : (
            <div className="h-full w-full bg-muted/40" />
          )}
        </div>
        <span className="pointer-events-none absolute top-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
          {formatTimecode(info.durationInFrames, info.fps)}
        </span>
      </div>
      <div className="px-0.5 pt-3">
        <h3 className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {info.title}
        </h3>
        <p className="mt-1.5 truncate font-mono text-[11px] text-muted-foreground">
          {formatAspect(info.width, info.height)} ·{" "}
          {CATEGORY_LABELS[info.category]}
        </p>
      </div>
    </Link>
  );
}
