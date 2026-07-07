"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useState } from "react";
import { GameplayBanner } from "@/features/gameplay/components/gameplay-banner";
import { cdnAsset } from "@/lib/cdn";

type GameplayVideo = { id: string; title: string; src: string };

async function fetchGameplay(): Promise<GameplayVideo[]> {
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

export function GameplayGallery() {
  const [active, setActive] = useState<GameplayVideo | null>(null);
  const { data: videos = [], isPending } = useQuery({
    queryKey: ["gameplay"],
    queryFn: fetchGameplay,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-col gap-6">
      <GameplayBanner count={videos.length} />

      {isPending ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholders
              key={i}
              className="aspect-[9/16] w-full rounded-xl"
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
          <h2 className="text-lg font-medium tracking-tight">
            No gameplay yet
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Upload clips to the <code>gameplay/</code> folder of your R2 bucket
            and they'll show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {videos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(v)}
              className="group overflow-hidden rounded-xl border border-border bg-muted/40 text-left transition-colors hover:border-foreground/25"
            >
              {/* biome-ignore lint/a11y/useMediaCaption: silent gameplay preview */}
              <video
                src={v.src}
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
              <div className="px-2.5 py-2">
                <span className="block truncate text-[11px] font-medium">
                  {v.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={active !== null}
        onOpenChange={(o) => !o && setActive(null)}
      >
        <DialogContent className="w-auto max-w-[min(90vw,26rem)] overflow-hidden p-0">
          {active ? (
            <>
              <DialogTitle className="px-4 pt-4 text-sm font-medium">
                {active.title}
              </DialogTitle>
              {/* biome-ignore lint/a11y/useMediaCaption: gameplay clip preview */}
              <video
                src={active.src}
                autoPlay
                loop
                controls
                playsInline
                className="aspect-[9/16] w-full bg-black object-contain"
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
