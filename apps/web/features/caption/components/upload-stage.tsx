"use client";

import {
  CheckmarkCircle02Icon,
  ClosedCaptionIcon,
  CloudUploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@workspace/ui/components/button";
import { WaveSpinner } from "@workspace/ui/components/wave-spinner";
import { cn } from "@workspace/ui/lib/utils";
import { useRef, useState } from "react";

export type ProcessStep = "audio" | "transcribe";

const STEPS: { key: ProcessStep; label: string }[] = [
  { key: "audio", label: "Reading the audio track" },
  { key: "transcribe", label: "Transcribing with Whisper" },
];

export function UploadStage({
  stage,
  step,
  error,
  onFile,
}: {
  stage: "idle" | "processing";
  step: ProcessStep;
  error: string | null;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const processing = stage === "processing";

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="mb-8 space-y-2 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <HugeiconsIcon icon={ClosedCaptionIcon} size={24} />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Caption your video
          </h1>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Whisper transcribes every word with timestamps. Restyle the
            captions, trim the dead air, export the MP4.
          </p>
        </div>

        {processing ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              {STEPS.map((s, i) => {
                const activeIndex = STEPS.findIndex((x) => x.key === step);
                const state =
                  i < activeIndex
                    ? "done"
                    : i === activeIndex
                      ? "active"
                      : "pending";
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center">
                      {state === "done" ? (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={18}
                          className="text-primary"
                        />
                      ) : state === "active" ? (
                        <WaveSpinner className="scale-75" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        state === "pending"
                          ? "text-muted-foreground/60"
                          : "text-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Only the audio leaves your browser — the video stays local.
            </p>
          </div>
        ) : (
          // biome-ignore lint/a11y/useSemanticElements: drop-zone needs drag-and-drop events that a native <button> swallows
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) onFile(dropped);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              dragging
                ? "border-primary/60 bg-primary/5"
                : "border-border bg-card/50 hover:border-muted-foreground/40",
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
              <HugeiconsIcon icon={CloudUploadIcon} size={22} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drop a video here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                MP4 or WebM · audio up to ~13 minutes
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Choose video
            </Button>
          </div>
        )}

        {error ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
