"use client";

import {
  FullScreenIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  VolumeHighIcon,
  VolumeOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { PlayerRef } from "@remotion/player";
import { Button } from "@workspace/ui/components/button";
import { Slider } from "@workspace/ui/components/slider";
import { useEffect, useState } from "react";
import { formatTime } from "../lib/editor";

export function PlayerControls({
  playerRef,
  durationInFrames,
  fps,
}: {
  playerRef: React.RefObject<PlayerRef | null>;
  durationInFrames: number;
  fps: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    setMuted(player.isMuted());
    const onFrame = (e: { detail: { frame: number } }) =>
      setFrame(e.detail.frame);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onMute = (e: { detail: { isMuted: boolean } }) =>
      setMuted(e.detail.isMuted);
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("mutechange", onMute);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("mutechange", onMute);
    };
  }, [playerRef]);

  const stepFrame = (delta: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.pause();
    player.seekTo(
      Math.min(
        durationInFrames - 1,
        Math.max(0, player.getCurrentFrame() + delta),
      ),
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <Slider
        value={[frame]}
        min={0}
        max={Math.max(1, durationInFrames - 1)}
        step={1}
        onValueChange={([v]) => {
          if (v != null) playerRef.current?.seekTo(v);
        }}
        aria-label="Seek"
      />
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          onClick={() => playerRef.current?.toggle()}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} size={16} />
        </Button>
        <span className="font-mono text-xs tabular-nums">
          {formatTime(frame / fps)}{" "}
          <span className="text-muted-foreground">
            / {formatTime(durationInFrames / fps)}
          </span>
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => stepFrame(-1)}
            aria-label="Previous frame"
          >
            <HugeiconsIcon icon={PreviousIcon} size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => stepFrame(1)}
            aria-label="Next frame"
          >
            <HugeiconsIcon icon={NextIcon} size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => {
              const player = playerRef.current;
              if (!player) return;
              if (player.isMuted()) player.unmute();
              else player.mute();
            }}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            <HugeiconsIcon
              icon={muted ? VolumeOffIcon : VolumeHighIcon}
              size={16}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => playerRef.current?.requestFullscreen()}
            aria-label="Fullscreen"
          >
            <HugeiconsIcon icon={FullScreenIcon} size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
