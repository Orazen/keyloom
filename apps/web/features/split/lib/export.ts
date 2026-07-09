"use client";

import type {
  renderMediaOnWeb,
  WebRendererHardwareAcceleration,
} from "@remotion/web-renderer";
import type { SplitStackProps } from "@workspace/compositions/compositions/SplitStack/SplitStack";

export const SPLIT_FPS = 30;
export const SPLIT_WIDTH = 1080;
export const SPLIT_HEIGHT = 1920;

export type SplitExportArgs = {
  props: SplitStackProps;
  durationInFrames: number;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
};

type WebRenderArgs = Parameters<typeof renderMediaOnWeb>[0];
type WebRenderResult = Awaited<ReturnType<typeof renderMediaOnWeb>>;

// Same ladder as the captions export: hardware encoders reject some configs
// outright instead of falling back, and can crash mid-render with opaque
// internal errors — retry the whole ladder on any non-abort failure so the
// software rung can rescue a flaky hardware path.
const ACCELERATION_FALLBACK: WebRendererHardwareAcceleration[] = [
  "prefer-hardware",
  "no-preference",
  "prefer-software",
];

async function renderWithFallback(
  baseOptions: Omit<WebRenderArgs, "hardwareAcceleration">,
): Promise<WebRenderResult> {
  const { renderMediaOnWeb } = await import("@remotion/web-renderer");
  let lastError: unknown;
  for (const hardwareAcceleration of ACCELERATION_FALLBACK) {
    try {
      return await renderMediaOnWeb({ ...baseOptions, hardwareAcceleration });
    } catch (err) {
      lastError = err;
      if (baseOptions.signal?.aborted) throw err;
    }
  }
  throw lastError;
}

export async function exportSplitVideo({
  props,
  durationInFrames,
  signal,
  onProgress,
}: SplitExportArgs): Promise<{ blob: Blob; filename: string }> {
  const { SplitStack } = await import(
    "@workspace/compositions/compositions/SplitStack/SplitStack"
  );

  const result = await renderWithFallback({
    composition: {
      id: "SplitStack",
      component: SplitStack as React.ComponentType<Record<string, unknown>>,
      calculateMetadata: () => ({
        durationInFrames,
        fps: SPLIT_FPS,
        width: SPLIT_WIDTH,
        height: SPLIT_HEIGHT,
      }),
    },
    inputProps: props as unknown as Record<string, unknown>,
    container: "mp4",
    videoCodec: "h264",
    signal: signal ?? null,
    onProgress: ({ progress }) => onProgress?.(progress),
  });

  const blob = await result.getBlob();
  const filename = `split-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19)}.mp4`;
  return { blob, filename };
}
