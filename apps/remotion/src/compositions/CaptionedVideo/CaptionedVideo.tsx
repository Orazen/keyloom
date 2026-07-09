"use client";
import { Video } from "@remotion/media";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { ClipStyle } from "../../clip-style";
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
  fontScale?: number;
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
  captionVAlign,
  captionHAlign,
  captionPos,
  captionWidth,
  fontScale,
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
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {sequences.map((s) => (
        <Sequence key={s.key} from={s.from} durationInFrames={s.duration}>
          <Video
            src={src}
            trimBefore={s.trimBefore}
            trimAfter={s.trimAfter}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
        clipStyle={clipStyle}
        clipTheme={clipTheme}
        hideWhenInactive
        editMode={editMode}
        onCaptionMove={onCaptionMove}
        onCaptionScale={onCaptionScale}
        onCaptionWidth={onCaptionWidth}
      />
    </AbsoluteFill>
  );
};
