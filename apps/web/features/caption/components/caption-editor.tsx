"use client";

import type { TimeRange } from "@workspace/compositions/compositions/CaptionedVideo/timeline";
import {
  buildKeeps,
  editedDuration,
  originalToEdited,
} from "@workspace/compositions/compositions/CaptionedVideo/timeline";
import type {
  FontKey,
  HAlign,
  VAlign,
} from "@workspace/compositions/compositions/TikTokCaption/config";
import { DEFAULT_FONT_KEY } from "@workspace/compositions/compositions/TikTokCaption/config";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import type { TranscribeResponse } from "@/app/api/shorts/transcribe/route";
import {
  type Cut,
  probeVideo,
  retimeSegment,
  type Segment,
  segmentsFromWords,
  type VideoMeta,
  visibleWords,
} from "../lib/editor";
import { prepareWhisperAudio } from "../lib/extract-audio";
import { PreviewPanel } from "./preview-panel";
import { SegmentsPanel } from "./segments-panel";
import { type ProcessStep, UploadStage } from "./upload-stage";

type DocState = {
  segments: Segment[];
  cuts: Cut[];
};

type DocAction =
  | { type: "init"; segments: Segment[] }
  | { type: "edit-segment"; id: string; text: string }
  | { type: "toggle-hidden"; id: string }
  | { type: "delete-segment"; id: string }
  | { type: "add-cut"; range: TimeRange }
  | { type: "remove-cut"; id: string };

function docReducer(state: DocState, action: DocAction): DocState {
  switch (action.type) {
    case "init":
      return { segments: action.segments, cuts: [] };
    case "edit-segment":
      return {
        ...state,
        segments: state.segments.flatMap((s) => {
          if (s.id !== action.id) return [s];
          const words = retimeSegment(s, action.text);
          return words.length > 0 ? [{ ...s, words }] : [];
        }),
      };
    case "toggle-hidden":
      return {
        ...state,
        segments: state.segments.map((s) =>
          s.id === action.id ? { ...s, hidden: !s.hidden } : s,
        ),
      };
    case "delete-segment":
      return {
        ...state,
        segments: state.segments.filter((s) => s.id !== action.id),
      };
    case "add-cut":
      return {
        ...state,
        cuts: [...state.cuts, { ...action.range, id: crypto.randomUUID() }],
      };
    case "remove-cut":
      return { ...state, cuts: state.cuts.filter((c) => c.id !== action.id) };
    default:
      return state;
  }
}

export type CaptionStyle = {
  fontKey: FontKey;
  fontScale: number;
  vAlign: VAlign;
  hAlign: HAlign;
  textColor: string;
  accentColor: string;
};

const INITIAL_STYLE: CaptionStyle = {
  fontKey: DEFAULT_FONT_KEY,
  fontScale: 1,
  vAlign: "bottom",
  hAlign: "center",
  textColor: "#ffffff",
  accentColor: "#facc15",
};

type StyleAction = { type: "patch"; patch: Partial<CaptionStyle> };

function styleReducer(state: CaptionStyle, action: StyleAction): CaptionStyle {
  return action.type === "patch" ? { ...state, ...action.patch } : state;
}

type Stage = "idle" | "processing" | "ready";

export function CaptionEditor() {
  const [stage, setStage] = useState<Stage>("idle");
  const [step, setStep] = useState<ProcessStep>("audio");
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoMeta | null>(null);
  const [doc, dispatchDoc] = useReducer(docReducer, {
    segments: [],
    cuts: [],
  });
  const [style, dispatchStyle] = useReducer(styleReducer, INITIAL_STYLE);
  const busyRef = useRef(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (busyRef.current) return;
      busyRef.current = true;
      const url = URL.createObjectURL(file);
      setError(null);
      setStage("processing");
      setStep("audio");
      try {
        const meta = await probeVideo(url);
        const upload = await prepareWhisperAudio(file);
        setStep("transcribe");
        const body = new FormData();
        body.append("file", upload.blob, upload.filename);
        const res = await fetch("/api/shorts/transcribe", {
          method: "POST",
          body,
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(err.error ?? `Transcription failed (${res.status})`);
        }
        const data = (await res.json()) as TranscribeResponse;
        const words = data.words.filter((w) => w.text.length > 0);
        if (video) URL.revokeObjectURL(video.url);
        dispatchDoc({ type: "init", segments: segmentsFromWords(words) });
        setVideo({ url, ...meta, filename: file.name });
        setStage("ready");
        toast.success(`Captioned ${words.length} words`);
      } catch (e) {
        URL.revokeObjectURL(url);
        const message = e instanceof Error ? e.message : "Upload failed";
        setError(message);
        setStage(video ? "ready" : "idle");
        toast.error(message);
      } finally {
        busyRef.current = false;
      }
    },
    [video],
  );

  const keeps = useMemo(
    () => (video ? buildKeeps(doc.cuts, video.duration) : []),
    [doc.cuts, video],
  );
  const words = useMemo(() => visibleWords(doc.segments), [doc.segments]);
  const editedSeconds = useMemo(() => editedDuration(keeps), [keeps]);

  const [playheadOriginal, setPlayheadOriginal] = useState(0);
  const seekRequestRef = useRef<((editedSeconds: number) => void) | null>(null);

  const seekToOriginal = useCallback(
    (t: number) => {
      seekRequestRef.current?.(originalToEdited(t, keeps));
    },
    [keeps],
  );

  if (stage !== "ready" || !video) {
    return (
      <UploadStage
        stage={stage === "processing" ? "processing" : "idle"}
        step={step}
        error={error}
        onFile={handleFile}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <SegmentsPanel
          segments={doc.segments}
          keeps={keeps}
          playheadOriginal={playheadOriginal}
          onSeek={seekToOriginal}
          onEdit={(id, text) => dispatchDoc({ type: "edit-segment", id, text })}
          onToggleHidden={(id) => dispatchDoc({ type: "toggle-hidden", id })}
          onDelete={(id) => dispatchDoc({ type: "delete-segment", id })}
        />
        <PreviewPanel
          video={video}
          words={words}
          cuts={doc.cuts}
          keeps={keeps}
          editedSeconds={editedSeconds}
          playheadOriginal={playheadOriginal}
          style={style}
          onStyle={(patch) => dispatchStyle({ type: "patch", patch })}
          onAddCut={(range) => dispatchDoc({ type: "add-cut", range })}
          onRemoveCut={(id) => dispatchDoc({ type: "remove-cut", id })}
          onPlayhead={setPlayheadOriginal}
          seekRequestRef={seekRequestRef}
          onReplaceVideo={handleFile}
        />
      </div>
    </TooltipProvider>
  );
}
