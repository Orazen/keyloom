"use client";
import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { type ClipStyle, resolveClipStyle } from "../../clip-style";
import { snap } from "../../snap";
import { useCanvasLayout } from "../../use-canvas-layout";
import { useDesignFrame } from "../../use-design-frame";

export type StatCounterProps = {
  target: number;
  label: string;
  prefix: string;
  suffix: string;
  clipStyle?: ClipStyle;
};

export const StatCounter: React.FC<StatCounterProps> = ({
  target,
  label,
  prefix,
  suffix,
  clipStyle,
}) => {
  const frame = useDesignFrame();
  const { fps } = useVideoConfig();
  const { vw, vh, vmin } = useCanvasLayout();
  const s = resolveClipStyle(clipStyle, {
    background: "#ffffff",
    color: "#0f1014",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, sans-serif",
    accent: "#0f1014",
  });

  const countUp = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 130,
  });
  const settle = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.8 },
  });
  const barGrow = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 90, mass: 0.9 },
  });

  const safeTarget = Math.max(0, target);
  const value = Math.round(countUp * safeTarget);
  const formatted = value.toLocaleString();
  const finalText = `${prefix}${safeTarget.toLocaleString()}${suffix}`;

  const numberSize = Math.min(
    vw(13),
    vh(18),
    vw(86) / (Math.max(1, finalText.length) * 0.6),
  );

  const trimmedLabel = label.trim();

  return (
    <AbsoluteFill
      style={{
        background: s.background,
        color: s.color,
        fontFamily: s.fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${vmin(8)}px ${vmin(7)}px`,
        textAlign: "center",
      }}
    >
      {trimmedLabel && (
        <div
          style={{
            fontSize: vmin(2.5),
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: s.color,
            opacity: 0.5,
            marginBottom: vmin(3.4),
          }}
        >
          {trimmedLabel}
        </div>
      )}
      <div
        style={{
          fontSize: numberSize,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          transform: `translate3d(0, ${snap((1 - settle) * vmin(1.6))}px, 0) scale(${0.94 + settle * 0.06})`,
        }}
      >
        {prefix}
        {formatted}
        {suffix}
      </div>
      <div
        style={{
          marginTop: vmin(3.6),
          width: barGrow * vmin(9),
          height: vmin(0.55),
          borderRadius: vmin(0.3),
          background: s.accent,
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};
