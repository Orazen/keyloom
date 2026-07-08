"use client";
import { Video } from "@remotion/media";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { ClipStyle } from "../../clip-style";
import type { HAlign, VAlign } from "../TikTokCaption/config";
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
  fontScale?: number;
  clipStyle?: ClipStyle;
};

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  src,
  durationSec,
  words,
  cuts,
  captionVAlign,
  captionHAlign,
  fontScale,
  clipStyle,
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
        fontScale={fontScale}
        clipStyle={clipStyle}
        hideWhenInactive
      />
    </AbsoluteFill>
  );
};
