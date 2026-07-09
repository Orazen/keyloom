"use client";
import { useRef } from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { ClipStyle } from "../../clip-style";
import { SmartVideo } from "../../smart-video";
import type { CaptionPos, HAlign, VAlign } from "../TikTokCaption/config";
import {
  type CaptionWord,
  TikTokCaptionLayer,
} from "../TikTokCaption/TikTokCaption";
import { buildKeeps, remapWords, type TimeRange } from "./timeline";

export type CaptionedVideoProps = {
  src: string;
  /** Duration of the source video in seconds (original, pre-cut). */
  durationSec: number;
  /** Words on the original video timeline; hidden segments already excluded. */
  words: CaptionWord[];
  /** Removed ranges on the original timeline. */
  cuts: TimeRange[];
  captionVAlign?: VAlign;
  captionHAlign?: HAlign;
  captionPos?: CaptionPos | null;
  captionWidth?: number | null;
  /** CSS filter applied to the source video (color grades, B&W, …). */
  videoFilter?: string;
  fontScale?: number;
  maxWordsPerPhrase?: number;
  clipStyle?: ClipStyle;
  clipTheme?: string;
  /** Player-only: enables drag/resize of the caption box (see TikTokCaption). */
  editMode?: boolean;
  onCaptionMove?: (pos: CaptionPos) => void;
  onCaptionScale?: (fontScale: number) => void;
  onCaptionWidth?: (widthFrac: number) => void;
};

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  src,
  durationSec,
  words,
  cuts,
  videoFilter,
  captionVAlign,
  captionHAlign,
  captionPos,
  captionWidth,
  fontScale,
  maxWordsPerPhrase,
  clipStyle,
  clipTheme,
  editMode,
  onCaptionMove,
  onCaptionScale,
  onCaptionWidth,
}) => {
  const { fps } = useVideoConfig();
  const keeps = buildKeeps(cuts, durationSec);
  const editedWords = remapWords(words, keeps);
  // Media-clock caption sync only holds while source time == timeline time;
  // cuts remap the timeline, so they fall back to the frame clock.
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const syncToMedia = cuts.length === 0;

  let offset = 0;
  const sequences = keeps.map((k) => {
    const from = Math.round(offset * fps);
    const duration = Math.max(1, Math.round((k.end - k.start) * fps));
    offset += k.end - k.start;
    return {
      key: `${k.start.toFixed(3)}-${k.end.toFixed(3)}`,
      from,
      duration,
      trimBefore: Math.round(k.start * fps),
      trimAfter: Math.round(k.end * fps),
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", filter: videoFilter }}>
      {sequences.map((s) => (
        <Sequence key={s.key} from={s.from} durationInFrames={s.duration}>
          <SmartVideo
            src={src}
            trimBefore={s.trimBefore}
            trimAfter={s.trimAfter}
            objectFit="contain"
            style={{ width: "100%", height: "100%" }}
            mediaRef={syncToMedia ? previewVideoRef : undefined}
          />
        </Sequence>
      ))}
      <TikTokCaptionLayer
        words={editedWords}
        captionVAlign={captionVAlign}
        captionHAlign={captionHAlign}
        captionPos={captionPos}
        captionWidth={captionWidth}
        fontScale={fontScale}
        maxWordsPerPhrase={maxWordsPerPhrase}
        clipStyle={clipStyle}
        clipTheme={clipTheme}
        hideWhenInactive
        editMode={editMode}
        onCaptionMove={onCaptionMove}
        onCaptionScale={onCaptionScale}
        onCaptionWidth={onCaptionWidth}
        previewMediaRef={syncToMedia ? previewVideoRef : undefined}
      />
    </AbsoluteFill>
  );
};
