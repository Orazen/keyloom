"use client";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { type ClipStyle, resolveClipStyle } from "../../clip-style";
import { snap } from "../../snap";
import { useDesignFrame } from "../../use-design-frame";

export type GitHubStarButtonProps = {
  owner: string;
  repo: string;
  startCount: number;
  endCount: number;
  theme: "light" | "dark";
  clipStyle?: ClipStyle;
};

const APPLE_EASE = Easing.bezier(0.16, 1, 0.3, 1);
const STAR_FILLED = "#e3b341";

const THEME = {
  light: {
    bg: "#ffffff",
    pageBg: "#f6f8fa",
    border: "#d1d9e0",
    btnBg: "#f6f8fa",
    btnBgActive: "#eef0f3",
    btnBorder: "#d1d9e0",
    text: "#1f2328",
    muted: "#59636e",
    countBg: "#ffffff",
    repoLink: "#0969da",
    cardShadow:
      "0 1px 0 rgba(31,35,40,0.04), 0 12px 36px rgba(140,149,159,0.22)",
  },
  dark: {
    bg: "#0d1117",
    pageBg: "#010409",
    border: "#3d444d",
    btnBg: "#212830",
    btnBgActive: "#3d444d",
    btnBorder: "#3d444d",
    text: "#f0f6fc",
    muted: "#9198a1",
    countBg: "#15191f",
    repoLink: "#4493f8",
    cardShadow: "0 12px 36px rgba(0,0,0,0.55)",
  },
} as const;

const STAR_BURST = 26;
const SCALE = 3;
const px = (n: number) => Math.round(n * SCALE);

const D_BREADCRUMB = 3;
const D_BUTTON = 9;

export const GitHubStarButton: React.FC<GitHubStarButtonProps> = ({
  owner,
  repo,
  startCount,
  endCount,
  theme,
  clipStyle,
}) => {
  const frame = useDesignFrame();
  const { fps } = useVideoConfig();
  const t = THEME[theme];

  const s = resolveClipStyle(clipStyle, {
    background: t.pageBg,
    color: t.text,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
    accent: STAR_FILLED,
  });

  const enter = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 140, mass: 0.6 },
  });

  const HOVER_AT = 26;
  const CLICK_AT = 44;
  const COUNT_START = CLICK_AT + 4;
  const COUNT_END = COUNT_START + 90;

  const hoverProgress = interpolate(frame, [HOVER_AT, HOVER_AT + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: APPLE_EASE,
  });

  const clickProgress = spring({
    frame: frame - CLICK_AT,
    fps,
    config: { damping: 9, stiffness: 220, mass: 0.4 },
    durationInFrames: 26,
  });

  const starFill = interpolate(frame, [CLICK_AT - 2, CLICK_AT + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const starScale = 1 + clickProgress * 0.18 - clickProgress * 0.1;

  const count = Math.round(
    interpolate(frame, [COUNT_START, COUNT_END], [startCount, endCount], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: APPLE_EASE,
    }),
  );

  const burstAge = frame - CLICK_AT;

  return (
    <AbsoluteFill
      style={{
        background: s.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: s.fontFamily,
        color: s.color,
        padding: "8%",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          background: t.bg,
          border: `${px(1)}px solid ${t.border}`,
          borderRadius: px(12),
          padding: `${px(24)}px ${px(28)}px`,
          boxShadow: t.cardShadow,
          display: "flex",
          flexDirection: "column",
          gap: px(20),
          transform: `translate3d(0, ${snap((1 - enter) * 16)}px, 0) scale(${0.98 + enter * 0.02})`,
        }}
      >
        <RevealItem frame={frame - D_BREADCRUMB} fps={fps}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: px(8),
              fontSize: px(22),
              minWidth: 0,
            }}
          >
            <RepoIcon color={t.muted} />
            <span
              style={{
                color: t.repoLink,
                fontWeight: 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
              }}
            >
              {owner}
            </span>
            <span style={{ color: t.muted, flexShrink: 0 }}>/</span>
            <span
              style={{
                color: t.repoLink,
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {repo}
            </span>
            <span
              style={{
                marginLeft: px(8),
                fontSize: px(12),
                fontWeight: 500,
                padding: `${px(2)}px ${px(10)}px`,
                borderRadius: 999,
                border: `${px(1)}px solid ${t.border}`,
                color: t.muted,
                flexShrink: 0,
              }}
            >
              Public
            </span>
          </div>
        </RevealItem>

        <RevealItem frame={frame - D_BUTTON} fps={fps}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "stretch",
                transform: `scale(${1 - clickProgress * 0.03})`,
                transformOrigin: "center",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: px(8),
                  padding: `${px(7)}px ${px(14)}px`,
                  border: `${px(1)}px solid ${t.btnBorder}`,
                  borderRight: "none",
                  borderRadius: `${px(6)}px 0 0 ${px(6)}px`,
                  fontSize: px(14),
                  fontWeight: 500,
                  background: mixHover(t.btnBg, t.btnBgActive, hoverProgress),
                  color: t.text,
                  position: "relative",
                }}
              >
                <StarSvg
                  fillProgress={starFill}
                  scale={starScale}
                  muted={t.muted}
                  accent={s.accent}
                />
                <span>Star</span>
                <BurstParticles
                  age={burstAge}
                  active={burstAge > 0 && burstAge < STAR_BURST + 14}
                  accent={s.accent}
                />
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: px(56),
                  padding: `${px(7)}px ${px(14)}px`,
                  border: `${px(1)}px solid ${t.btnBorder}`,
                  borderRadius: `0 ${px(6)}px ${px(6)}px 0`,
                  fontSize: px(14),
                  fontWeight: 600,
                  background: t.countBg,
                  color: t.text,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {count.toLocaleString()}
              </span>
            </div>
          </div>
        </RevealItem>
      </div>
    </AbsoluteFill>
  );
};

function RepoIcon({ color }: { color: string }) {
  return (
    <svg
      width={px(20)}
      height={px(20)}
      viewBox="0 0 16 16"
      fill={color}
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
    </svg>
  );
}

function StarSvg({
  fillProgress,
  scale,
  muted,
  accent,
}: {
  fillProgress: number;
  scale: number;
  muted: string;
  accent: string;
}) {
  return (
    <svg
      width={px(16)}
      height={px(16)}
      viewBox="0 0 16 16"
      style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
      aria-hidden
    >
      <path
        d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
        fill={fillProgress > 0.5 ? accent : "transparent"}
        stroke={fillProgress > 0.5 ? accent : muted}
        strokeWidth={1}
      />
    </svg>
  );
}

function BurstParticles({
  age,
  active,
  accent,
}: {
  age: number;
  active: boolean;
  accent: string;
}) {
  if (!active) return null;
  const t = Math.min(1, age / STAR_BURST);
  const ease = 1 - (1 - t) ** 3;
  return (
    <span
      style={{
        position: "absolute",
        left: px(22),
        top: "50%",
        width: 1,
        height: 1,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = px(18) + ease * px(14);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              width: px(4),
              height: px(4),
              borderRadius: "50%",
              background: accent,
              transform: `translate(${x}px, ${y}px) scale(${1 - ease})`,
              opacity: 1 - ease,
            }}
          />
        );
      })}
    </span>
  );
}

function mixHover(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return `color-mix(in srgb, ${a} ${(1 - t) * 100}%, ${b} ${t * 100}%)`;
}

function RevealItem({
  frame,
  fps,
  children,
}: {
  frame: number;
  fps: number;
  children: React.ReactNode;
}) {
  const reveal = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.7 },
  });
  return (
    <div
      style={{
        opacity: reveal,
        transform: `translate3d(0, ${snap((1 - reveal) * 12)}px, 0)`,
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}
