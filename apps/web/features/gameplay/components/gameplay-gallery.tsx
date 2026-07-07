"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
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
  const { data: videos = [], isPending } = useQuery({
    queryKey: ["gameplay"],
    queryFn: fetchGameplay,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Gameplay
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Background gameplay clips — pair one under a meme for the split-screen
          look.
        </p>
      </div>

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {videos.map((v) => (
            <div
              key={v.id}
              className="group overflow-hidden rounded-xl border border-border bg-muted/40"
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
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="truncate text-[13px] font-medium">
                  {v.title}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  9:16
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
