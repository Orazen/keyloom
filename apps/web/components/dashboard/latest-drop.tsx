"use client";

import { compositions } from "@workspace/compositions/registry";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

// The registry array is append-ordered, so its tail is the newest batch.
const DROP_SIZE = 6;
const NEWEST = compositions
  .filter((c) => !c.hideFromAgent && c.category !== "background")
  .slice(-DROP_SIZE)
  .reverse();

export function LatestDrop() {
  const featured = NEWEST[0];
  if (!featured) return null;

  const names = NEWEST.slice(0, 3)
    .map((c) => c.title)
    .join(", ");

  return (
    <section className="overflow-hidden rounded-2xl bg-[#0e0e12] p-6 text-white sm:p-8">
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
    </section>
  );
}
