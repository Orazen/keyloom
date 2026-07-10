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
  const [volume, setVolumeState] = useState(1);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    setMuted(player.isMuted());
    setVolumeState(player.getVolume());
    const onFrame = (e: { detail: { frame: number } }) =>
      setFrame(e.detail.frame);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onMute = (e: { detail: { isMuted: boolean } }) =>
      setMuted(e.detail.isMuted);
    const onVolume = (e: { detail: { volume: number } }) =>
      setVolumeState(e.detail.volume);
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("mutechange", onMute);
    player.addEventListener("volumechange", onVolume);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("mutechange", onMute);
      player.removeEventListener("volumechange", onVolume);
    };
  }, [playerRef]);

  const silent = muted || volume === 0;

  const setVolume = (v: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(v);
    if (v > 0 && player.isMuted()) player.unmute();
    if (v === 0 && !player.isMuted()) player.mute();
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted() || player.getVolume() === 0) {
      player.unmute();
      if (player.getVolume() === 0) player.setVolume(1);
    } else {
      player.mute();
    }
  };

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
    <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-white/15 bg-black/35 p-3 text-white shadow-lg backdrop-blur-xl">
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
          className="size-9 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:bg-white/10 dark:hover:bg-white/20"
          onClick={() => playerRef.current?.toggle()}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} size={16} />
        </Button>
        <span className="font-mono text-xs tabular-nums">
          {formatTime(frame / fps)}{" "}
          <span className="text-white/50">
            / {formatTime(durationInFrames / fps)}
          </span>
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => stepFrame(-1)}
            aria-label="Previous frame"
          >
            <HugeiconsIcon icon={PreviousIcon} size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => stepFrame(1)}
            aria-label="Next frame"
          >
            <HugeiconsIcon icon={NextIcon} size={16} />
          </Button>
          <div className="group/volume relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={toggleMute}
              aria-label={silent ? "Unmute" : "Mute"}
            >
              <HugeiconsIcon
                icon={silent ? VolumeOffIcon : VolumeHighIcon}
                size={16}
              />
            </Button>
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 pb-1.5 opacity-0 transition-opacity duration-150 group-focus-within/volume:pointer-events-auto group-focus-within/volume:opacity-100 group-hover/volume:pointer-events-auto group-hover/volume:opacity-100">
              <div className="flex h-32 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 py-3.5 shadow-lg backdrop-blur-xl">
                <Slider
                  orientation="vertical"
                  value={[silent ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([v]) => {
                    if (v != null) setVolume(v);
                  }}
                  className="h-full data-vertical:min-h-0 [&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:w-4"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-white/70 hover:bg-white/10 hover:text-white"
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
