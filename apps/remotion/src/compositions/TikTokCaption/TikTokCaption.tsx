"use client";
import { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useCurrentScale,
  useVideoConfig,
} from "remotion";
import { type ClipStyle, resolveClipStyle } from "../../clip-style";
import { useFontReady } from "../../use-font-ready";
import {
  type CaptionPos,
  FONTS,
  type FontKey,
  fontKeyFromFamily,
  type HAlign,
  type VAlign,
} from "./config";
import { CAPTION_THEMES, DEFAULT_CAPTION_THEME } from "./themes";

// Single-weight display faces (Anton, Bebas, Lilita) rely on the browser's
// synthetic bold at 800 — the shipped Classic look. Multi-weight families
// load a real heavy face instead.
export const WEIGHT_BY_FONT: Partial<Record<FontKey, number>> = {
  poppins: 900,
  montserrat: 900,
  inter: 700,
  playfair: 700,
  courierPrime: 700,
  // Synthetic bold smears the marker strokes — render at its native weight.
  permanentMarker: 400,
};

export type CaptionWord = {
  start: number;
  end: number;
  text: string;
};

export type TikTokCaptionProps = {
  words: CaptionWord[];
  /** Kept for editor transcription flows; captions do not render audio. */
  audioUrl?: string;
  captionVAlign?: VAlign;
  captionHAlign?: HAlign;
  /**
   * Free placement (box center, fractions of composition size). When set it
   * overrides the alignment props. Written by dragging in the caption editor.
   */
  captionPos?: CaptionPos | null;
  /**
   * Caption box width as a fraction of composition width. Text wraps to fit.
   * Written by dragging the side handles; null uses the natural text width.
   */
  captionWidth?: number | null;
  // Multiplier on the base font size. 1 = medium, 0.7 small, 1.6 huge.
  fontScale?: number;
  /**
   * Max words shown per caption. 1 gives the viral word-pop style; ~3
   * (default) matches speech pace; 5+ reads like subtitle lines. Pauses in
   * speech still force a break regardless.
   */
  maxWordsPerPhrase?: number;
  clipStyle?: ClipStyle;
  /** Curated look from ./themes — same id the studio stores at clip.style.theme. */
  clipTheme?: string;
  /**
   * By default the last phrase lingers through silence (classic TikTok
   * hold). Captioned-video flows with deletable segments set this so
   * removed words leave a clean gap instead of holding the prior phrase.
   */
  hideWhenInactive?: boolean;
  /**
   * Player-only editing affordances (drag to move, corner handles to
   * resize). Never passed during export or studio renders — the overlay
   * relies on useCurrentScale(), which only exists inside a Player.
   */
  editMode?: boolean;
  onCaptionMove?: (pos: CaptionPos) => void;
  onCaptionScale?: (fontScale: number) => void;
  onCaptionWidth?: (widthFrac: number) => void;
};

const BASE_FONT_SIZE = 132;
// TikTok-style captions show 2–3 words at a time. We split sooner on
// pauses to keep phrases readable in short-form clips.
const PHRASE_MAX_GAP_SECONDS = 0.3;
const PHRASE_MAX_WORDS = 3;

const VERT_TO_JUSTIFY: Record<VAlign, string> = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
};

const HORIZ_TO_ALIGN: Record<HAlign, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const HORIZ_TO_TEXT_ALIGN: Record<HAlign, "left" | "center" | "right"> = {
  left: "left",
  center: "center",
  right: "right",
};

export function groupIntoPhrases(
  words: CaptionWord[],
  maxWords: number = PHRASE_MAX_WORDS,
): CaptionWord[][] {
  const phrases: CaptionWord[][] = [];
  let current: CaptionWord[] = [];
  const limit = Math.max(1, Math.round(maxWords));
  for (const w of words) {
    const prev = current[current.length - 1];
    const shouldBreak =
      current.length >= limit ||
      (prev && w.start - prev.end > PHRASE_MAX_GAP_SECONDS);
    if (shouldBreak && current.length > 0) {
      phrases.push(current);
      current = [];
    }
    current.push(w);
  }
  if (current.length > 0) phrases.push(current);
  return phrases;
}

export type TikTokCaptionLayerProps = Omit<TikTokCaptionProps, "audioUrl">;

const INACTIVE_HOLD_SECONDS = 0.2;
// Whisper word starts run slightly behind the audible onset, and a late
// caption reads far worse than a hair-early one — bias the clock forward.
const TIMING_LEAD_SECONDS = 0.08;
// Inside a short mid-speech gap, pop the upcoming word a beat early instead
// of holding the previous one until the exact start timestamp.
const EARLY_POP_SECONDS = 0.15;
const MIN_FONT_SCALE = 0.4;
const MAX_FONT_SCALE = 2.6;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const MIN_WIDTH_FRAC = 0.15;
const MAX_WIDTH_FRAC = 0.96;

// Corners scale the font; side midpoints squeeze the box width (text wraps).
const HANDLES = [
  { key: "nw", left: 0, top: 0, cursor: "nwse-resize", kind: "scale" },
  { key: "ne", left: 1, top: 0, cursor: "nesw-resize", kind: "scale" },
  { key: "sw", left: 0, top: 1, cursor: "nesw-resize", kind: "scale" },
  { key: "se", left: 1, top: 1, cursor: "nwse-resize", kind: "scale" },
  { key: "w", left: 0, top: 0.5, cursor: "ew-resize", kind: "width" },
  { key: "e", left: 1, top: 0.5, cursor: "ew-resize", kind: "width" },
] as const;

type DragState =
  | {
      mode: "move";
      startCenterX: number;
      startCenterY: number;
      startX: number;
      startY: number;
    }
  | {
      mode: "resize";
      centerX: number;
      centerY: number;
      startDist: number;
      startScale: number;
    }
  | {
      mode: "width";
      centerX: number;
    };

const CaptionDragLayer: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
  fontScale: number;
  accent: string;
  onMove?: (pos: CaptionPos) => void;
  onScale?: (fontScale: number) => void;
  onWidth?: (widthFrac: number) => void;
  children: React.ReactNode;
}> = ({
  containerRef,
  width,
  height,
  fontScale,
  accent,
  onMove,
  onScale,
  onWidth,
  children,
}) => {
  const scale = useCurrentScale();
  const boxRef = useRef<HTMLDivElement>(null);
  // Pointer capture (not window listeners): releasing the mouse outside the
  // window would otherwise eat the pointerup and leave the drag stuck —
  // resizing/moving on bare mouse movement until the next click.
  const dragRef = useRef<DragState | null>(null);
  const [hovered, setHovered] = useState(false);
  const [interacting, setInteracting] = useState(false);

  // The corner handles sit just outside the box, past the outline gap.
  // Hiding the moment the pointer leaves the box would unmount a handle
  // right as the cursor travels toward it — hide on a short grace period
  // instead, cancelled if the pointer lands on the box or a handle.
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  const onHoverStart = () => {
    cancelHide();
    setHovered(true);
  };
  const onHoverEnd = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setHovered(false);
    }, 250);
  };
  useEffect(() => cancelHide, []);

  // These record intent only; the event continues bubbling to the box's
  // pointerdown, which sees dragRef set and just takes pointer capture.
  const startResize = (e: React.PointerEvent) => {
    if (!onScale) return;
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const centerX = r.left + r.width / 2;
    const centerY = r.top + r.height / 2;
    dragRef.current = {
      mode: "resize",
      centerX,
      centerY,
      startDist: Math.max(
        1,
        Math.hypot(e.clientX - centerX, e.clientY - centerY),
      ),
      startScale: fontScale,
    };
  };

  const startWidthResize = () => {
    if (!onWidth) return;
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    dragRef.current = { mode: "width", centerX: r.left + r.width / 2 };
  };

  const onBoxPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (!dragRef.current) {
      if (!onMove) return;
      const container = containerRef.current;
      const box = boxRef.current;
      if (!container || !box) return;
      const cRect = container.getBoundingClientRect();
      const bRect = box.getBoundingClientRect();
      dragRef.current = {
        mode: "move",
        startCenterX: (bRect.left + bRect.width / 2 - cRect.left) / scale,
        startCenterY: (bRect.top + bRect.height / 2 - cRect.top) / scale,
        startX: e.clientX,
        startY: e.clientY,
      };
    }
    e.preventDefault();
    boxRef.current?.setPointerCapture(e.pointerId);
    setInteracting(true);
  };

  const onBoxPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.mode === "move") {
      const cx = d.startCenterX + (e.clientX - d.startX) / scale;
      const cy = d.startCenterY + (e.clientY - d.startY) / scale;
      onMove?.({
        x: Math.round(clamp(cx / width, 0.04, 0.96) * 1000) / 1000,
        y: Math.round(clamp(cy / height, 0.04, 0.96) * 1000) / 1000,
      });
    } else if (d.mode === "resize") {
      const dist = Math.hypot(e.clientX - d.centerX, e.clientY - d.centerY);
      const next = clamp(
        d.startScale * (dist / d.startDist),
        MIN_FONT_SCALE,
        MAX_FONT_SCALE,
      );
      onScale?.(Math.round(next * 100) / 100);
    } else {
      // Symmetric squeeze around the box center: the pointer's horizontal
      // distance from center is half the new box width.
      const halfWidth = Math.abs(e.clientX - d.centerX) / scale;
      const frac = clamp(
        (halfWidth * 2) / width,
        MIN_WIDTH_FRAC,
        MAX_WIDTH_FRAC,
      );
      onWidth?.(Math.round(frac * 1000) / 1000);
    }
  };

  const endInteraction = (e: React.PointerEvent) => {
    dragRef.current = null;
    setInteracting(false);
    const box = boxRef.current;
    if (box?.hasPointerCapture(e.pointerId)) {
      box.releasePointerCapture(e.pointerId);
    }
  };

  const outlineVisible = hovered || interacting;
  const outlineWidth = 2 / scale;
  const handleSize = 14 / scale;
  // Invisible hit zone around each handle — the visible dot alone is a
  // fiddly ~14px screen-space target.
  const handleHit = 30 / scale;

  return (
    <div
      ref={boxRef}
      onPointerDown={onBoxPointerDown}
      onPointerMove={onBoxPointerMove}
      onPointerUp={endInteraction}
      onPointerCancel={endInteraction}
      onLostPointerCapture={endInteraction}
      onPointerEnter={onHoverStart}
      onPointerLeave={onHoverEnd}
      style={{
        position: "relative",
        pointerEvents: "auto",
        cursor: "move",
        touchAction: "none",
        userSelect: "none",
        outline: outlineVisible
          ? `${outlineWidth}px solid ${accent}`
          : undefined,
        outlineOffset: 6 / scale,
      }}
    >
      {children}
      {outlineVisible
        ? HANDLES.filter((h) =>
            h.kind === "width" ? Boolean(onWidth) : Boolean(onScale),
          ).map((h) => (
            <div
              key={h.key}
              onPointerDown={
                h.kind === "width" ? startWidthResize : startResize
              }
              style={{
                position: "absolute",
                left: `${h.left * 100}%`,
                top: `${h.top * 100}%`,
                width: handleHit,
                height: handleHit,
                marginLeft:
                  -handleHit / 2 +
                  (h.left === 0 ? -6 : h.left === 1 ? 6 : 0) / scale,
                marginTop:
                  -handleHit / 2 +
                  (h.top === 0 ? -6 : h.top === 1 ? 6 : 0) / scale,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: h.cursor,
              }}
            >
              <div
                style={
                  h.kind === "width"
                    ? {
                        width: handleSize * 0.45,
                        height: handleSize * 1.4,
                        borderRadius: handleSize,
                        background: "#ffffff",
                        border: `${outlineWidth}px solid ${accent}`,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                      }
                    : {
                        width: handleSize,
                        height: handleSize,
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: `${outlineWidth}px solid ${accent}`,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                      }
                }
              />
            </div>
          ))
        : null}
    </div>
  );
};

export const TikTokCaptionLayer: React.FC<TikTokCaptionLayerProps> = ({
  words,
  captionVAlign = "center",
  captionHAlign = "center",
  captionPos,
  captionWidth,
  fontScale = 1,
  maxWordsPerPhrase,
  clipStyle,
  clipTheme,
  hideWhenInactive = false,
  editMode = false,
  onCaptionMove,
  onCaptionScale,
  onCaptionWidth,
}) => {
  // Real frame — word timestamps from Whisper are wall-clock seconds, so
  // they must be compared against real time, not the 60fps design frame.
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);

  const theme =
    CAPTION_THEMES[clipTheme ?? ""] ?? CAPTION_THEMES[DEFAULT_CAPTION_THEME]!;

  // Inactive words use `color`, active word uses `accent`, font is
  // `fontFamily` — all editable from the universal Style section. The theme
  // supplies the defaults so picking one restyles unstained clips too.
  const s = resolveClipStyle(clipStyle, {
    background: "transparent",
    color: theme.textColor,
    fontFamily: FONTS[theme.fontKey].cssFamily,
    accent: theme.accentColor,
  });

  useFontReady(s.fontFamily);

  const timeSeconds = frame / fps + TIMING_LEAD_SECONDS;

  let activeIndex = -1;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!w) continue;
    if (timeSeconds >= w.start && timeSeconds < w.end) {
      activeIndex = i;
      break;
    }
    if (timeSeconds < w.start) {
      activeIndex = w.start - timeSeconds <= EARLY_POP_SECONDS ? i : i - 1;
      break;
    }
    if (i === words.length - 1 && timeSeconds >= w.end) {
      activeIndex = i;
    }
  }

  const phrases = groupIntoPhrases(words, maxWordsPerPhrase);
  let activePhrase =
    activeIndex >= 0
      ? phrases.find((p) => p.some((w) => w === words[activeIndex]))
      : undefined;
  if (hideWhenInactive && activePhrase) {
    const phraseEnd = activePhrase[activePhrase.length - 1]?.end ?? 0;
    if (timeSeconds > phraseEnd + INACTIVE_HOLD_SECONDS) {
      activePhrase = undefined;
    }
  }

  const shortSide = Math.min(width, height);
  const baseSize = (BASE_FONT_SIZE * shortSide) / 1080;
  const fontSize = baseSize * fontScale;
  const strokeWidth = Math.max(2, fontSize * 0.06);
  const fontWeight = WEIGHT_BY_FONT[fontKeyFromFamily(s.fontFamily)] ?? 800;

  const isTransparent = s.background === "transparent";
  const positioned = captionPos != null;
  const boxWidth = captionWidth != null ? captionWidth * width : null;

  const shadowFor = (
    level: "none" | "soft" | "heavy" | "glow",
  ): string | undefined => {
    if (level === "none") return undefined;
    if (level === "glow") {
      return `0 0 ${fontSize * 0.14}px ${s.accent}, 0 0 ${fontSize * 0.4}px ${s.accent}, 0 ${fontSize * 0.02}px ${fontSize * 0.05}px rgba(0,0,0,0.6)`;
    }
    if (level === "heavy") {
      return `0 ${fontSize * 0.05}px ${fontSize * 0.1}px rgba(0,0,0,0.85), 0 ${fontSize * 0.12}px ${fontSize * 0.3}px rgba(0,0,0,0.5)`;
    }
    return isTransparent
      ? `0 ${fontSize * 0.025}px ${fontSize * 0.06}px rgba(0,0,0,0.55)`
      : `0 ${fontSize * 0.02}px ${fontSize * 0.04}px rgba(0,0,0,0.5)`;
  };

  const textTransform = theme.uppercase
    ? ("uppercase" as const)
    : theme.lowercase
      ? ("lowercase" as const)
      : undefined;

  const wordStyle = (w: CaptionWord, inline: boolean): React.CSSProperties => {
    const isActive = w === words[activeIndex];
    const chipActive = Boolean(theme.activeWordBackground) && isActive;
    const hollowFill = Boolean(theme.hollow) && !isActive;
    return {
      display: inline ? "inline" : "inline-block",
      fontSize,
      fontWeight,
      letterSpacing: "-0.01em",
      textTransform,
      fontStyle: theme.italic ? "italic" : undefined,
      color: hollowFill
        ? "transparent"
        : isActive && !chipActive
          ? s.accent
          : s.color,
      WebkitTextStroke: theme.stroke
        ? `${strokeWidth}px ${theme.hollow ? s.color : "#000"}`
        : undefined,
      paintOrder: "stroke fill",
      textShadow: shadowFor(theme.shadow),
      // Padding + matching negative margin: the chip paints without
      // shifting word layout as the active word advances.
      ...(chipActive
        ? {
            background: s.accent,
            borderRadius: fontSize * 0.16,
            padding: `${fontSize * 0.05}px ${fontSize * 0.12}px`,
            margin: `-${fontSize * 0.05}px -${fontSize * 0.12}px`,
          }
        : {}),
    };
  };

  // Native-TikTok pill mode: one continuous inline span wraps naturally and
  // box-decoration-break: clone rounds every line fragment into its own pill.
  const phrase = activePhrase ? (
    theme.lineBackground ? (
      <div
        style={{
          textAlign: HORIZ_TO_TEXT_ALIGN[captionHAlign],
          width: boxWidth ?? undefined,
          maxWidth: boxWidth ?? width * 0.88,
          lineHeight: 1.55,
        }}
      >
        <span
          style={{
            background: theme.lineBackground,
            WebkitBoxDecorationBreak: "clone",
            boxDecorationBreak: "clone",
            borderRadius: fontSize * 0.22,
            padding: `${fontSize * 0.08}px ${fontSize * 0.26}px`,
          }}
        >
          {activePhrase.map((w, i) => (
            <span key={`${w.start}-${i}`} style={wordStyle(w, true)}>
              {w.text}
              {i < activePhrase.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: `${fontSize * 0.12}px ${fontSize * 0.28}px`,
          justifyContent: HORIZ_TO_ALIGN[captionHAlign],
          textAlign: HORIZ_TO_TEXT_ALIGN[captionHAlign],
          width: boxWidth ?? undefined,
          maxWidth: boxWidth ?? width * 0.88,
          lineHeight: 1.05,
          ...(theme.phraseBackground
            ? {
                background: theme.phraseBackground,
                padding: `${fontSize * 0.16}px ${fontSize * 0.3}px`,
                borderRadius: fontSize * 0.2,
              }
            : {}),
        }}
      >
        {activePhrase.map((w, i) => (
          <span key={`${w.start}-${i}`} style={wordStyle(w, false)}>
            {w.text}
          </span>
        ))}
      </div>
    )
  ) : null;

  const content =
    editMode && phrase ? (
      <CaptionDragLayer
        containerRef={containerRef}
        width={width}
        height={height}
        fontScale={fontScale}
        accent={s.accent}
        onMove={onCaptionMove}
        onScale={onCaptionScale}
        onWidth={onCaptionWidth}
      >
        {phrase}
      </CaptionDragLayer>
    ) : (
      phrase
    );

  return (
    <AbsoluteFill
      ref={containerRef}
      style={{
        background: isTransparent ? "transparent" : s.background,
        fontFamily: s.fontFamily,
        fontWeight,
        pointerEvents: "none",
        ...(positioned
          ? {}
          : {
              display: "flex",
              flexDirection: "column",
              alignItems: HORIZ_TO_ALIGN[captionHAlign],
              justifyContent: VERT_TO_JUSTIFY[captionVAlign],
              padding: `${height * 0.08}px ${width * 0.06}px`,
            }),
      }}
    >
      {/* Same element in both modes — remounting would reset the drag
          layer's hover/drag state mid-interaction when the first drag
          flips the layout from flex to absolute. */}
      <div
        style={
          positioned
            ? {
                position: "absolute",
                left: captionPos.x * width,
                top: captionPos.y * height,
                transform: "translate(-50%, -50%)",
                display: "flex",
                justifyContent: HORIZ_TO_ALIGN[captionHAlign],
                // Without an explicit width, an absolutely positioned box
                // shrink-fits against the distance from `left` to the
                // container edge — dragging toward an edge would reflow the
                // words onto more lines. max-content keeps line-wrapping
                // identical at every position (the phrase's own maxWidth
                // still caps it).
                width: "max-content",
                maxWidth: boxWidth ?? width * 0.88,
              }
            : { display: "flex", justifyContent: HORIZ_TO_ALIGN[captionHAlign] }
        }
      >
        {content}
      </div>
    </AbsoluteFill>
  );
};

export const TikTokCaption: React.FC<TikTokCaptionProps> = (props) => {
  return <TikTokCaptionLayer {...props} />;
};
