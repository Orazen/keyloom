"use client";

import {
  GridViewIcon,
  Search01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { useMemo, useState } from "react";
import type { MemeTemplate } from "@/lib/memes";
import { MemeReel } from "./meme-reel";
import { MemeThumbnail } from "./meme-thumbnail";

type View = "grid" | "reel";

const PAGE_SIZE = 20;

// Categories are derived from the template's key/id — the only metadata the
// bucket gives us. A tag only shows when at least one template matches it.
const TAGS = [
  { id: "green-screen", label: "Green screen", test: /green.?screen/i },
  {
    id: "reactions",
    label: "Reactions",
    test: /(cry|laugh|shock|confus|scream|facepalm|side.?eye|staring|angry|awkward|zoning)/i,
  },
  {
    id: "animals",
    label: "Animals",
    test: /(cat|dog|beaver|bear|monkey|frog|duck|bird|hamster|raccoon)/i,
  },
  { id: "packs", label: "Packs", test: /pack/i },
] as const;

type Filter = "all" | (typeof TAGS)[number]["id"];

export function MemeGallery({
  templates,
  onSelect,
}: {
  templates: MemeTemplate[];
  onSelect: (t: MemeTemplate) => void;
}) {
  const [view, setView] = useState<View>("grid");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const presentTags = useMemo(
    () => TAGS.filter((tag) => templates.some((t) => tag.test.test(t.id))),
    [templates],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tag = TAGS.find((t) => t.id === filter);
    return templates.filter((t) => {
      if (tag && !tag.test.test(t.id)) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q);
    });
  }, [templates, filter, query]);

  const visible = filtered.slice(0, visibleCount);

  const selectFilter = (next: Filter) => {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Memes
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Pick a template — you'll add your caption next.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search templates..."
              className="h-8 w-48 rounded-full pl-8 text-[13px] sm:w-56"
            />
          </div>
          <div className="inline-flex gap-1 rounded-full border border-border p-1">
            <Button
              size="sm"
              className="rounded-full"
              variant={view === "grid" ? "secondary" : "ghost"}
              onClick={() => setView("grid")}
            >
              <HugeiconsIcon icon={GridViewIcon} size={16} />
              Grid
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              variant={view === "reel" ? "secondary" : "ghost"}
              onClick={() => setView("reel")}
            >
              <HugeiconsIcon icon={SmartPhone01Icon} size={16} />
              Reel
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <nav className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill
            label="All"
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
        </nav>
        <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {filtered.length} templates
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No templates match “{query}”.
        </p>
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((t) => (
              <MemeThumbnail
                key={t.id}
                template={t}
                mode="hover"
                onSelect={onSelect}
              />
            ))}
          </div>
          {visibleCount < filtered.length ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                Load more
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <MemeReel templates={filtered} onSelect={onSelect} />
      )}
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
