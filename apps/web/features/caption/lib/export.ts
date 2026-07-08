"use client";

import type {
  renderMediaOnWeb,
  WebRendererHardwareAcceleration,
} from "@remotion/web-renderer";
import type { CaptionedVideoProps } from "@workspace/compositions/compositions/CaptionedVideo/CaptionedVideo";

export const CAPTION_FPS = 30;

export type CaptionExportArgs = {
  props: CaptionedVideoProps;
  width: number;
  height: number;
  durationInFrames: number;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
};

type WebRenderArgs = Parameters<typeof renderMediaOnWeb>[0];
type WebRenderResult = Awaited<ReturnType<typeof renderMediaOnWeb>>;

// Same ladder as the studio's local export: hardware encoders reject some
// configs outright instead of falling back, so retry down the ladder on
// encoder-config errors only.
const ACCELERATION_FALLBACK: WebRendererHardwareAcceleration[] = [
  "prefer-hardware",
  "no-preference",
  "prefer-software",
];

function isEncoderConfigError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /not supported by this browser|encoder configuration|hardware acceleration|configuration is not supported|isConfigSupported/i.test(
    msg,
  );
}

async function renderWithFallback(
  baseOptions: Omit<WebRenderArgs, "hardwareAcceleration">,
): Promise<WebRenderResult> {
  const { renderMediaOnWeb } = await import("@remotion/web-renderer");
  let lastError: unknown;
  for (let i = 0; i < ACCELERATION_FALLBACK.length; i++) {
    const hardwareAcceleration = ACCELERATION_FALLBACK[i]!;
    try {
      return await renderMediaOnWeb({ ...baseOptions, hardwareAcceleration });
    } catch (err) {
      lastError = err;
      if (baseOptions.signal?.aborted) throw err;
      if (
        i === ACCELERATION_FALLBACK.length - 1 ||
        !isEncoderConfigError(err)
      ) {
        throw err;
      }
    }
  }
  throw lastError;
}

export async function exportCaptionedVideo({
  props,
  width,
  height,
  durationInFrames,
  signal,
  onProgress,
}: CaptionExportArgs): Promise<{ blob: Blob; filename: string }> {
  const { CaptionedVideo } = await import(
    "@workspace/compositions/compositions/CaptionedVideo/CaptionedVideo"
  );

  // H.264 requires even dimensions.
  const evenWidth = Math.max(2, width - (width % 2));
  const evenHeight = Math.max(2, height - (height % 2));

  const result = await renderWithFallback({
    composition: {
      id: "CaptionedVideo",
      component: CaptionedVideo as React.ComponentType<Record<string, unknown>>,
      calculateMetadata: () => ({
        durationInFrames,
        fps: CAPTION_FPS,
        width: evenWidth,
        height: evenHeight,
      }),
    },
    inputProps: props as unknown as Record<string, unknown>,
    container: "mp4",
    videoCodec: "h264",
    signal: signal ?? null,
    onProgress: ({ progress }) => onProgress?.(progress),
  });

  const blob = await result.getBlob();
  const filename = `captions-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19)}.mp4`;
  return { blob, filename };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
