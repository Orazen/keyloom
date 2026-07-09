import type { TimeRange } from "@workspace/compositions/compositions/CaptionedVideo/timeline";
import {
  type CaptionWord,
  groupIntoPhrases,
} from "@workspace/compositions/compositions/TikTokCaption/TikTokCaption";

export type Segment = {
  id: string;
  words: CaptionWord[];
  hidden: boolean;
};

export type VideoMeta = {
  url: string;
  duration: number;
  width: number;
  height: number;
  filename: string;
};

export function segmentsFromWords(words: CaptionWord[]): Segment[] {
  return groupIntoPhrases(words).map((phrase) => ({
    id: crypto.randomUUID(),
    words: phrase,
    hidden: false,
  }));
}

export function visibleWords(segments: Segment[]): CaptionWord[] {
  return segments.filter((s) => !s.hidden).flatMap((s) => s.words);
}

export function segmentRange(seg: Segment): TimeRange {
  const first = seg.words[0];
  const last = seg.words[seg.words.length - 1];
  return { start: first?.start ?? 0, end: last?.end ?? 0 };
}

/**
 * Applies edited text back onto a segment. Same word count keeps Whisper's
 * per-word timings; a different count redistributes the segment's time span
 * across the new words, weighted by word length.
 */
export function retimeSegment(seg: Segment, text: string): CaptionWord[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  if (tokens.length === seg.words.length) {
    return seg.words.map((w, i) => ({ ...w, text: tokens[i]! }));
  }
  const { start, end } = segmentRange(seg);
  const span = Math.max(0.001, end - start);
  const totalChars = tokens.reduce((sum, t) => sum + t.length, 0);
  let cursor = start;
  return tokens.map((t) => {
    const dur = span * (t.length / totalChars);
    const word = { start: cursor, end: cursor + dur, text: t };
    cursor += dur;
    return word;
  });
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${m}:${rest.toFixed(1).padStart(4, "0")}`;
}

export function formatRange(range: TimeRange): string {
  return `${formatTime(range.start)} – ${formatTime(range.end)}`;
}

export async function probeVideo(
  url: string,
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      video.src = "";
    };
    video.onerror = () =>
      reject(new Error("This file doesn't look like a playable video."));
    video.src = url;
  });
}
