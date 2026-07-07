"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef } from "react";
import {
  backgroundForTemplate,
  type MemeTemplate,
} from "@/features/memes/lib/memes";

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

function isPack(template: MemeTemplate): boolean {
  return /pack/i.test(template.id);
}

type MemeThumbnailProps = {
  template: MemeTemplate;
  /**
   * "hover" plays the clip on mouse-over (grid); "view" plays it while scrolled
   * into view and pauses otherwise (the TikTok-style reel feed).
   */
  mode: "hover" | "view";
  className?: string;
  onSelect: (t: MemeTemplate) => void;
};

export function MemeThumbnail({
  template,
  mode,
  className,
  onSelect,
}: MemeThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pack = isPack(template);
  const bgSrc = pack ? undefined : backgroundForTemplate(template.id)?.src;

  useEffect(() => {
    if (mode !== "view") return;
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          v.muted = false;
          v.play().catch(() => {
            v.muted = true;
            v.play().catch(() => {});
          });
        } else {
          v.pause();
          v.currentTime = 0;
        }
      },
      { threshold: 0.6 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [mode]);

  const tile = (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl",
        mode === "hover" ? "aspect-[9/16]" : "h-full",
        pack ? "bg-[#0e0e12]" : "bg-muted/40",
      )}
    >
      {bgSrc ? (
        // biome-ignore lint/performance/noImgElement: local static preview thumbnail
        <img
          src={bgSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : !pack ? (
        <div
          aria-hidden
          className="absolute inset-0 dark:opacity-15"
          style={{ backgroundColor: pastelFor(template.id) }}
        />
      ) : null}

      <video
        ref={videoRef}
        src={template.src}
        muted={mode === "hover"}
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-contain"
        onMouseEnter={
          mode === "hover"
            ? (e) => {
                e.currentTarget.play().catch(() => {});
              }
            : undefined
        }
        onMouseLeave={
          mode === "hover"
            ? (e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }
            : undefined
        }
      />

      {pack ? (
        <span className="pointer-events-none absolute top-2 right-2 rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          Pack
        </span>
      ) : null}

      {mode === "view" ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left">
          <span className="text-xs font-medium text-white">
            {template.title}
          </span>
        </div>
      ) : null}
    </div>
  );

  if (mode === "view") {
    return (
      <button
        type="button"
        onClick={() => onSelect(template)}
        className={cn("block", className)}
      >
        {tile}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={cn("block w-full text-left", className)}
    >
      {tile}
      <div className="flex items-baseline justify-between gap-3 px-0.5 pt-2.5">
        <span className="truncate text-[13px] font-medium leading-tight">
          {template.title}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
          9:16
        </span>
      </div>
    </button>
  );
}
