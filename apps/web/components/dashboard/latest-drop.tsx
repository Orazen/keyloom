"use client";

import {
  compositionModulePath,
  compositions,
} from "@workspace/compositions/registry";
import { Button } from "@workspace/ui/components/button";
import dynamic from "next/dynamic";
import Link from "next/link";

const LivePreview = dynamic(
  () => import("@/components/gallery/live-preview").then((m) => m.LivePreview),
  { ssr: false },
);

// The registry array is append-ordered, so its tail is the newest batch.
const DROP_SIZE = 6;
const NEWEST = compositions
  .filter((c) => !c.hideFromAgent && c.category !== "background")
  .slice(-DROP_SIZE)
  .reverse();

const PREVIEW_HEIGHT_LANDSCAPE = 168;
const PREVIEW_HEIGHT_PORTRAIT = 220;

export function LatestDrop() {
  const featured = NEWEST[0];
  if (!featured) return null;

  const names = NEWEST.slice(0, 3)
    .map((c) => c.title)
    .join(", ");
  const aspect = featured.width / featured.height;
  const previewHeight =
    aspect >= 1 ? PREVIEW_HEIGHT_LANDSCAPE : PREVIEW_HEIGHT_PORTRAIT;

  return (
    <section className="flex items-center justify-between gap-8 overflow-hidden rounded-2xl bg-[#0e0e12] p-6 text-white sm:p-8">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          Latest drop
        </p>
        <h2 className="mt-2 text-pretty font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {NEWEST.length} new scenes just landed.
        </h2>
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-white/60">
          {names} and more — fresh off the loom.
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link href={`/component/${featured.id}/edit`} prefetch={false}>
            Open the newest scene
          </Link>
        </Button>
      </div>

      <div
        className="hidden shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 md:block"
        style={{ height: previewHeight, aspectRatio: `${aspect}` }}
      >
        <LivePreview
          modulePath={compositionModulePath(featured)}
          id={featured.id}
          defaultProps={featured.defaultProps as Record<string, unknown>}
          durationInFrames={featured.durationInFrames}
          fps={featured.fps}
          width={featured.width}
          height={featured.height}
        />
      </div>
    </section>
  );
}
