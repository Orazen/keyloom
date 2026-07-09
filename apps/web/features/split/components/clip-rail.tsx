"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { cdnAsset } from "@/lib/cdn";

export type GameplayClip = { id: string; title: string; src: string };

async function fetchGameplay(): Promise<GameplayClip[]> {
  const res = await fetch("/api/gameplay");
  if (!res.ok) throw new Error(`Gameplay request failed: ${res.status}`);
  const data: { videos?: { id: string; title: string; key: string }[] } =
    await res.json();
  return (data.videos ?? []).map((v) => ({
    id: v.id,
    title: v.title,
    src: cdnAsset(v.key),
  }));
}

export function useGameplayClips() {
  return useQuery({
    queryKey: ["gameplay"],
    queryFn: fetchGameplay,
    staleTime: 5 * 60 * 1000,
  });
}

export function ClipRail({
  clips,
  isPending,
  selectedId,
  onSelect,
}: {
  clips: GameplayClip[];
  isPending: boolean;
  selectedId: string | null;
  onSelect: (clip: GameplayClip) => void;
}) {
  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholders
            key={i}
            className="aspect-[9/16] w-full rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm font-medium">No gameplay clips</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload clips to the <code>gameplay/</code> folder of your R2 bucket
          and they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {clips.map((clip) => (
        <button
          key={clip.id}
          type="button"
          onClick={() => onSelect(clip)}
          className={cn(
            "group overflow-hidden rounded-lg border text-left transition-colors",
            selectedId === clip.id
              ? "border-primary ring-2 ring-primary/40"
              : "border-border bg-muted/40 hover:border-foreground/25",
          )}
        >
          <video
            src={clip.src}
            muted
            loop
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full object-cover"
            onMouseEnter={(e) => {
              e.currentTarget.play().catch(() => {});
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
          <span className="block truncate px-2 py-1.5 text-[11px] font-medium">
            {clip.title}
          </span>
        </button>
      ))}
    </div>
  );
}
