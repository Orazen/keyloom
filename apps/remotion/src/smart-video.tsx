import { Video as MediaVideo } from "@remotion/media";
import { Video as Html5Video, useRemotionEnvironment } from "remotion";

type SmartVideoProps = {
  src: string;
  muted?: boolean;
  loop?: boolean;
  /** Constant volume, or a per-(sequence-local)-frame envelope. */
  volume?: number | ((frame: number) => number);
  /** Frames to skip into the source before playback starts. */
  trimBefore?: number;
  trimAfter?: number;
  objectFit?: "fill" | "contain" | "cover";
  style?: React.CSSProperties;
};

/**
 * Video that stays smooth in the <Player> AND captures in the export.
 *
 * Same split as SmartAudio: `@remotion/media`'s WebCodecs <Video> decodes
 * every frame on the CPU, which stutters badly during Player playback — but
 * it's the only video the in-browser web-renderer can capture. The classic
 * HTML5 <Video> plays natively (hardware decode, no per-frame extraction),
 * so the preview uses it and only the client-side render swaps in the
 * WebCodecs one.
 */
export function SmartVideo({ objectFit, style, ...props }: SmartVideoProps) {
  const env = useRemotionEnvironment();
  if (env.isRendering && env.isClientSideRendering) {
    return <MediaVideo {...props} objectFit={objectFit} style={style} />;
  }
  return (
    <Html5Video pauseWhenBuffering {...props} style={{ ...style, objectFit }} />
  );
}
