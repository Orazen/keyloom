"use client";

import {
  ArrowTurnBackwardIcon,
  CloudUploadIcon,
  Download01Icon,
  PauseIcon,
  PlayIcon,
  ScissorIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Player, type PlayerRef } from "@remotion/player";
import { CaptionedVideo } from "@workspace/compositions/compositions/CaptionedVideo/CaptionedVideo";
import type { TimeRange } from "@workspace/compositions/compositions/CaptionedVideo/timeline";
import {
  buildKeeps,
  editedToOriginal,
  originalToEdited,
} from "@workspace/compositions/compositions/CaptionedVideo/timeline";
import { FONTS } from "@workspace/compositions/compositions/TikTokCaption/config";
import type { CaptionWord } from "@workspace/compositions/compositions/TikTokCaption/TikTokCaption";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type Cut,
  formatRange,
  formatTime,
  type VideoMeta,
} from "../lib/editor";
import { CAPTION_FPS, downloadBlob, exportCaptionedVideo } from "../lib/export";
import type { CaptionStyle } from "./caption-editor";
import { CutTimeline } from "./cut-timeline";
import { StyleToolbar } from "./style-toolbar";

export function PreviewPanel({
  video,
  words,
  cuts,
  keeps,
  editedSeconds,
  playheadOriginal,
  style,
  onStyle,
  onAddCut,
  onRemoveCut,
  onPlayhead,
  seekRequestRef,
  onReplaceVideo,
}: {
  video: VideoMeta;
  words: CaptionWord[];
  cuts: Cut[];
  keeps: TimeRange[];
  editedSeconds: number;
  playheadOriginal: number;
  style: CaptionStyle;
  onStyle: (patch: Partial<CaptionStyle>) => void;
  onAddCut: (range: TimeRange) => void;
  onRemoveCut: (id: string) => void;
  onPlayhead: (originalSeconds: number) => void;
  seekRequestRef: React.MutableRefObject<
    ((editedSeconds: number) => void) | null
  >;
  onReplaceVideo: (file: File) => void;
}) {
  const playerRef = useRef<PlayerRef>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedTime, setEditedTime] = useState(0);
  const [selection, setSelection] = useState<{ in?: number; out?: number }>({});
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const durationInFrames = Math.max(1, Math.round(editedSeconds * CAPTION_FPS));
  const empty = editedSeconds < 0.05;

  const inputProps = useMemo(
    () => ({
      src: video.url,
      durationSec: video.duration,
      words,
      cuts: cuts.map((c) => ({ start: c.start, end: c.end })),
      captionVAlign: style.vAlign,
      captionHAlign: style.hAlign,
      fontScale: style.fontScale,
      clipStyle: {
        background: "transparent",
        color: style.textColor,
        fontFamily: FONTS[style.fontKey].cssFamily,
        accent: style.accentColor,
      },
    }),
    [video, words, cuts, style],
  );

  // The frameupdate listener reads keeps through a ref: seekTo() fires
  // frameupdate synchronously, before React re-renders with post-cut keeps,
  // so a closure over the prop would map frames through stale ranges.
  const keepsRef = useRef(keeps);
  keepsRef.current = keeps;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = (e: { detail: { frame: number } }) => {
      const edited = e.detail.frame / CAPTION_FPS;
      setEditedTime(edited);
      onPlayhead(editedToOriginal(edited, keepsRef.current));
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, [onPlayhead]);

  useEffect(() => {
    seekRequestRef.current = (edited: number) => {
      playerRef.current?.seekTo(Math.round(edited * CAPTION_FPS));
    };
    return () => {
      seekRequestRef.current = null;
    };
  }, [seekRequestRef]);

  const seekToOriginal = (t: number) => {
    playerRef.current?.seekTo(
      Math.round(originalToEdited(t, keeps) * CAPTION_FPS),
    );
  };

  const canCut =
    selection.in != null &&
    selection.out != null &&
    selection.out > selection.in;

  const applyCut = () => {
    if (selection.in == null || selection.out == null) return;
    const cutRange = { start: selection.in, end: selection.out };
    onAddCut(cutRange);
    setSelection({});
    if (
      playheadOriginal >= cutRange.start &&
      playheadOriginal <= cutRange.end
    ) {
      // Seek through the post-cut ranges — the `keeps` prop is still pre-cut
      // in this tick.
      const keepsAfter = buildKeeps(
        [...cuts, cutRange].map((c) => ({ start: c.start, end: c.end })),
        video.duration,
      );
      const edited = originalToEdited(cutRange.end, keepsAfter);
      keepsRef.current = keepsAfter;
      playerRef.current?.seekTo(Math.round(edited * CAPTION_FPS));
      setEditedTime(edited);
      onPlayhead(cutRange.end);
    }
  };

  const handleExport = async () => {
    if (exportProgress != null) {
      abortRef.current?.abort();
      return;
    }
    if (empty) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setExportProgress(0);
    playerRef.current?.pause();
    try {
      const { blob, filename } = await exportCaptionedVideo({
        props: inputProps,
        width: video.width,
        height: video.height,
        durationInFrames,
        signal: controller.signal,
        onProgress: setExportProgress,
      });
      downloadBlob(blob, filename);
      toast.success("MP4 exported");
    } catch (e) {
      if (!controller.signal.aborted) {
        toast.error(e instanceof Error ? e.message : "Export failed");
      }
    } finally {
      setExportProgress(null);
      abortRef.current = null;
    }
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <StyleToolbar style={style} onStyle={onStyle} />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => replaceInputRef.current?.click()}
          >
            <HugeiconsIcon icon={CloudUploadIcon} size={15} />
            Replace video
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={empty}
            className="min-w-28"
          >
            {exportProgress != null ? (
              `Cancel · ${Math.round(exportProgress * 100)}%`
            ) : (
              <>
                <HugeiconsIcon icon={Download01Icon} size={15} />
                Export MP4
              </>
            )}
          </Button>
          <input
            ref={replaceInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onReplaceVideo(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/30">
        {empty ? (
          <p className="text-sm text-muted-foreground">
            Everything is cut — restore a section below to preview.
          </p>
        ) : (
          <Player
            ref={playerRef}
            component={CaptionedVideo}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            fps={CAPTION_FPS}
            compositionWidth={video.width}
            compositionHeight={video.height}
            style={{ width: "100%", height: "100%" }}
            acknowledgeRemotionLicense
          />
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={() => playerRef.current?.toggle()}
            disabled={empty}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} size={16} />
          </Button>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {formatTime(editedTime)}{" "}
            <span className="text-muted-foreground/50">/</span>{" "}
            {formatTime(editedSeconds)}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() =>
                setSelection((s) => ({
                  in: playheadOriginal,
                  out:
                    s.out != null && s.out > playheadOriginal
                      ? s.out
                      : undefined,
                }))
              }
            >
              Mark in
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() =>
                setSelection((s) =>
                  s.in != null && playheadOriginal > s.in
                    ? { ...s, out: playheadOriginal }
                    : { in: undefined, out: playheadOriginal },
                )
              }
            >
              Mark out
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 px-2.5 text-xs",
                canCut && "border-primary/40 text-primary hover:text-primary",
              )}
              disabled={!canCut}
              onClick={applyCut}
            >
              <HugeiconsIcon icon={ScissorIcon} size={13} />
              Cut selection
            </Button>
            {selection.in != null || selection.out != null ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setSelection({})}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <CutTimeline
          duration={video.duration}
          playheadOriginal={playheadOriginal}
          cuts={cuts}
          selection={selection}
          onSeek={seekToOriginal}
        />

        {cuts.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Cut
            </span>
            {cuts.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 py-0.5 pl-2.5 pr-1 font-mono text-[11px] tabular-nums text-muted-foreground"
              >
                {formatRange(c)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 rounded-full"
                  onClick={() => onRemoveCut(c.id)}
                  aria-label={`Restore ${formatRange(c)}`}
                >
                  <HugeiconsIcon icon={ArrowTurnBackwardIcon} size={11} />
                </Button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
