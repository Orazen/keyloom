"use client";
import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { type ClipStyle, resolveClipStyle } from "../../clip-style";
import { snap } from "../../snap";
import { useDesignFrame } from "../../use-design-frame";

export type PricingCardProps = {
  tier: string;
  price: string;
  period: string;
  features: string;
  cta: string;
  highlighted: "yes" | "no";
  theme: "light" | "dark";
  clipStyle?: ClipStyle;
};

const D_TIER = 2;
const D_PRICE = 6;
const D_FEATURES_START = 12;
const FEATURE_STAGGER = 4;
const D_CTA_AFTER_FEATURES = 6;
const MAX_FEATURES = 4;

const tint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  period,
  features,
  cta,
  highlighted,
  theme,
  clipStyle,
}) => {
  const frame = useDesignFrame();
  const { fps } = useVideoConfig();
  const isDark = theme === "dark";
  const isHighlighted = highlighted === "yes";
  const s = resolveClipStyle(clipStyle, {
    background: isDark ? "#0e0f13" : "#f4f4f6",
    color: isDark ? "#ffffff" : "#0f1014",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, sans-serif",
    accent: "#6366f1",
  });

  const cardBg = isDark ? "#17181d" : "#ffffff";
  const muted = tint(s.color, 55);

  const featureList = features
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean)
    .slice(0, MAX_FEATURES);

  const cardIn = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const ctaDelay =
    D_FEATURES_START +
    featureList.length * FEATURE_STAGGER +
    D_CTA_AFTER_FEATURES;

  return (
    <AbsoluteFill
      style={{
        background: s.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: s.fontFamily,
        padding: "8%",
      }}
    >
      <div
        style={{
          width: 470,
          background: cardBg,
          borderRadius: 24,
          padding: "40px 40px 36px",
          boxShadow: isDark
            ? "0 1px 2px rgba(0,0,0,0.4), 0 12px 28px rgba(0,0,0,0.35), 0 36px 80px rgba(0,0,0,0.45)"
            : "0 1px 2px rgba(15,16,20,0.05), 0 10px 24px rgba(15,16,20,0.06), 0 32px 72px rgba(15,16,20,0.1)",
          transform: `translate3d(0, ${snap((1 - cardIn) * 18)}px, 0) scale(${0.98 + cardIn * 0.02})`,
        }}
      >
        <RevealItem frame={frame - D_TIER} fps={fps}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: muted,
              }}
            >
              {tier}
            </div>
            {isHighlighted ? (
              <div
                style={{
                  background: tint(s.accent, 12),
                  color: s.accent,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  borderRadius: 999,
                }}
              >
                Most popular
              </div>
            ) : null}
          </div>
        </RevealItem>

        <RevealItem frame={frame - D_PRICE} fps={fps}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginTop: 14,
            }}
          >
            <span
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: s.color,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {price}
            </span>
            {period ? (
              <span style={{ fontSize: 20, color: muted, fontWeight: 500 }}>
                {period}
              </span>
            ) : null}
          </div>
        </RevealItem>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            marginTop: 28,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {featureList.map((f, i) => (
            <RevealItem
              key={i}
              frame={frame - (D_FEATURES_START + i * FEATURE_STAGGER)}
              fps={fps}
            >
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 17,
                  fontWeight: 500,
                  color: tint(s.color, 82),
                  lineHeight: 1.3,
                }}
              >
                <CheckMark accent={s.accent} />
                <span>{f}</span>
              </li>
            </RevealItem>
          ))}
        </ul>

        <RevealItem frame={frame - ctaDelay} fps={fps}>
          <div
            style={{
              marginTop: 30,
              width: "100%",
              padding: "16px",
              borderRadius: 999,
              background: s.accent,
              color: "#ffffff",
              fontSize: 17,
              fontWeight: 600,
              textAlign: "center",
              letterSpacing: "-0.01em",
              boxShadow: `0 10px 24px ${tint(s.accent, 35)}`,
            }}
          >
            {cta}
          </div>
        </RevealItem>
      </div>
    </AbsoluteFill>
  );
};

function CheckMark({ accent }: { accent: string }) {
  return (
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: tint(accent, 12),
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6.5l2.5 2.5L10 3"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
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
        transform: `translate3d(0, ${snap((1 - reveal) * 14)}px, 0)`,
      }}
    >
      {children}
    </div>
  );
}
