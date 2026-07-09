"use client";

import {
  Cancel01Icon,
  MusicNote01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Slider } from "@workspace/ui/components/slider";
import { cn } from "@workspace/ui/lib/utils";
import { useRef } from "react";
import { cdnAsset } from "@/lib/cdn";

export type MusicTrack = {
  src: string;
  name: string;
  volume: number;
};

const BUNDLED_TRACKS: { src: string; name: string }[] = [
  { src: "/audio/samples/upbeat-corporate.mp3", name: "Upbeat Corporate" },
  { src: "/audio/samples/relaxed-vlog.mp3", name: "Relaxed Vlog" },
  { src: "/audio/samples/cinematic-doc.mp3", name: "Cinematic Doc" },
];

const DEFAULT_VOLUME = 0.2;

async function fetchLibrary(): Promise<{ src: string; name: string }[]> {
  const res = await fetch("/api/music");
  if (!res.ok) return [];
  const data: { tracks?: { id: string; title: string; key: string }[] } =
    await res.json();
  return (data.tracks ?? []).map((t) => ({
    src: cdnAsset(t.key),
    name: t.title,
  }));
}

export function MusicPanel({
  music,
  onChange,
}: {
  music: MusicTrack | null;
  onChange: (music: MusicTrack | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: library = [] } = useQuery({
    queryKey: ["music-library"],
    queryFn: fetchLibrary,
    staleTime: 5 * 60 * 1000,
  });
  const tracks = [...library, ...BUNDLED_TRACKS];

  const pick = (src: string, name: string) => {
    if (music?.src.startsWith("blob:")) URL.revokeObjectURL(music.src);
    onChange({ src, name, volume: music?.volume ?? DEFAULT_VOLUME });
  };

  const clear = () => {
    if (music?.src.startsWith("blob:")) URL.revokeObjectURL(music.src);
    onChange(null);
  };

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Music</h2>
        {music ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={clear}
            aria-label="Remove music"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </Button>
        ) : null}
      </header>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {tracks.map((t) => {
            const active = music?.src === t.src;
            return (
              <button
                key={t.src}
                type="button"
                onClick={() => pick(t.src, t.name)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "border-primary/50 bg-primary/10"
                    : "border-transparent hover:bg-muted",
                )}
              >
                <HugeiconsIcon
                  icon={MusicNote01Icon}
                  size={15}
                  className={active ? "text-primary" : "text-muted-foreground"}
                />
                <span className="min-w-0 flex-1 truncate">{t.name}</span>
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <HugeiconsIcon icon={Upload01Icon} size={15} />
          {music && music.src.startsWith("blob:")
            ? music.name
            : "Upload your own"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(URL.createObjectURL(f), f.name);
            e.target.value = "";
          }}
        />

        {music ? (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-muted-foreground">
              Volume
            </span>
            <Slider
              value={[music.volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) =>
                onChange({ ...music, volume: v ?? DEFAULT_VOLUME })
              }
              className="flex-1"
            />
            <span className="w-8 text-right font-mono text-xs text-muted-foreground">
              {Math.round(music.volume * 100)}%
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
