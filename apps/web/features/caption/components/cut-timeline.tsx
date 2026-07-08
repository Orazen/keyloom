"use client";

import type { TimeRange } from "@workspace/compositions/compositions/CaptionedVideo/timeline";
import { cn } from "@workspace/ui/lib/utils";
import { useCallback, useRef } from "react";
import type { Cut } from "../lib/editor";

/**
 * The timeline shows the ORIGINAL video: cuts stay visible as struck-out
 * slivers instead of collapsing away, so a removed section is always one
 * click from being restored. The playhead, however, never enters a cut —
 * seeking into one snaps to the next kept moment.
 */
export function CutTimeline({
  duration,
  playheadOriginal,
  cuts,
  selection,
  onSeek,
}: {
  duration: number;
  playheadOriginal: number;
  cuts: Cut[];
  selection: { in?: number; out?: number };
  onSeek: (originalSeconds: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const seekFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (clientX - rect.left) / rect.width),
      );
      onSeek(ratio * duration);
    },
    [duration, onSeek],
  );

  const pct = (t: number) => `${(Math.min(t, duration) / duration) * 100}%`;

  const selectionRange: TimeRange | null =
    selection.in != null &&
    selection.out != null &&
    selection.out > selection.in
      ? { start: selection.in, end: selection.out }
      : null;

  return (
    // biome-ignore lint/a11y/useSemanticElements: scrubber needs pointer-drag seeking; a native slider can't render cut/selection regions
    <div
      ref={trackRef}
      role="slider"
      aria-label="Timeline"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={playheadOriginal}
      tabIndex={0}
      className="relative h-9 cursor-pointer touch-none select-none overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        seekFromPointer(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          seekFromPointer(e.clientX);
        }
      }}
      onKeyDown={(e) => {
        const step = duration / 100;
        if (e.key === "ArrowLeft") onSeek(playheadOriginal - step);
        if (e.key === "ArrowRight") onSeek(playheadOriginal + step);
      }}
    >
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary/25" />

      {cuts.map((c) => (
        <div
          key={c.id}
          className="absolute inset-y-0 border-x border-destructive/30 bg-destructive/10"
          style={{
            left: pct(c.start),
            width: pct(c.end - c.start),
            backgroundImage:
              "repeating-linear-gradient(135deg, color-mix(in srgb, var(--destructive) 25%, transparent) 0 3px, transparent 3px 7px)",
          }}
        />
      ))}

      {selectionRange ? (
        <div
          className="absolute inset-y-0 border-x-2 border-primary bg-primary/15"
          style={{
            left: pct(selectionRange.start),
            width: pct(selectionRange.end - selectionRange.start),
          }}
        />
      ) : (
        <>
          {selection.in != null ? (
            <Marker position={pct(selection.in)} />
          ) : null}
          {selection.out != null ? (
            <Marker position={pct(selection.out)} />
          ) : null}
        </>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-foreground",
        )}
        style={{ left: pct(playheadOriginal) }}
      >
        <div className="absolute -top-0.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-foreground" />
      </div>
    </div>
  );
}

function Marker({ position }: { position: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-primary"
      style={{ left: position }}
    />
  );
}
