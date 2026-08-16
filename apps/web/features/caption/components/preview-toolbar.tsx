"use client";

import {
  MusicNote01Icon,
  PaintBoardIcon,
  Tick02Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Slider } from "@workspace/ui/components/slider";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { cdnAsset } from "@/lib/cdn";
import { FILTER_PRESETS, FILTERS_BY_ID } from "../lib/filters";

export type MusicTrack = {
  src: string;
  name: string;
  volume: number;
};

const BUNDLED_TRACKS: { src: string; name: string }[] = [];

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

function PillButton({
  icon,
  label,
  active,
  ...props
}: {
  icon: typeof MusicNote01Icon;
  label: string;
  active: boolean;
} & React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "max-w-44 rounded-full",
        active && "border-primary/40 bg-primary/5 text-primary",
      )}
      {...props}
    >
      <HugeiconsIcon icon={icon} size={15} />
      <span className="truncate">{label}</span>
    </Button>
  );
}

export function MusicPopover({
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
    <Popover>
      <PopoverTrigger asChild>
        <PillButton
          icon={MusicNote01Icon}
          label={music ? music.name : "Music"}
          active={Boolean(music)}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <div className="flex flex-col gap-2">
          <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
            <OptionRow active={!music} onClick={clear}>
              No music
            </OptionRow>
            {tracks.map((t) => (
              <OptionRow
                key={t.src}
                active={music?.src === t.src}
                onClick={() => pick(t.src, t.name)}
              >
                <HugeiconsIcon
                  icon={MusicNote01Icon}
                  size={15}
                  className={
                    music?.src === t.src
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
                <span className="min-w-0 flex-1 truncate">{t.name}</span>
              </OptionRow>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <HugeiconsIcon icon={Upload01Icon} size={15} />
            {music?.src.startsWith("blob:") ? music.name : "Upload your own"}
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
            <div className="flex items-center gap-2.5 px-1 pb-1">
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
      </PopoverContent>
    </Popover>
  );
}

function useVideoThumbnail(src: string) {
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    setThumb(null);
    let cancelled = false;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = src;

    const capture = () => {
      if (cancelled) return;
      const scale = 160 / video.videoWidth;
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumb(canvas.toDataURL("image/jpeg", 0.7));
    };

    const onLoaded = () => {
      video.currentTime = Math.min(1, video.duration / 2);
    };
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", capture);
    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", capture);
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return thumb;
}

export function FilterPopover({
  filterId,
  videoSrc,
  onChange,
}: {
  filterId: string;
  videoSrc: string;
  onChange: (filterId: string) => void;
}) {
  const current = FILTERS_BY_ID[filterId];
  const active = Boolean(current?.css);
  const thumb = useVideoThumbnail(videoSrc);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <PillButton
          icon={PaintBoardIcon}
          label={active && current ? current.label : "Filter"}
          active={active}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <div className="grid grid-cols-3 gap-1.5">
          {FILTER_PRESETS.map((f) => {
            const selected = f.id === filterId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange(f.id)}
                className={cn(
                  "group flex flex-col gap-1 rounded-lg border p-1 transition-colors",
                  selected
                    ? "border-primary/60 ring-1 ring-primary/40"
                    : "border-transparent hover:border-border",
                )}
              >
                <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
                  {thumb ? (
                    // biome-ignore lint/performance/noImgElement: data-URL frame grab; next/image cannot optimize it
                    <img
                      src={thumb}
                      alt={`${f.label} preview`}
                      className="size-full object-cover"
                      style={{ filter: f.css }}
                    />
                  ) : null}
                  {selected ? (
                    <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={Tick02Icon} size={11} />
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "truncate text-center text-xs",
                    selected
                      ? "font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function OptionRow({
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
        "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
        active
          ? "border-primary/50 bg-primary/10"
          : "border-transparent hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
