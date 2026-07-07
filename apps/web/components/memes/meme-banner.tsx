"use client";

import { SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@workspace/ui/components/button";
import type { MemeTemplate } from "@/lib/memes";

export function MemeBanner({
  templates,
  onSelect,
}: {
  templates: MemeTemplate[];
  onSelect: (t: MemeTemplate) => void;
}) {
  const count = templates.length;

  const surprise = () => {
    if (count === 0) return;
    const pick = templates[Math.floor(Math.random() * count)];
    if (pick) onSelect(pick);
  };

  return (
    <section className="flex items-center justify-between gap-8 overflow-hidden rounded-2xl bg-[#0e0e12] p-6 text-white sm:p-8">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          Green screen memes
        </p>
        <h2 className="mt-2 text-pretty font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {count} templates, one caption from viral.
        </h2>
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-white/60">
          Pick a green-screen clip, drop in a background, add your caption, and
          export a 9:16 MP4 — right in the browser.
        </p>
        <Button size="sm" className="mt-5" onClick={surprise} disabled={!count}>
          <HugeiconsIcon icon={SparklesIcon} size={16} />
          Surprise me
        </Button>
      </div>

      <div className="hidden shrink-0 items-center pr-4 lg:flex">
        <PhoneCard className="-rotate-6 bg-gradient-to-b from-[#3a1d4d] to-[#241435]" />
        <PhoneCard className="-ml-5 rotate-3 bg-gradient-to-b from-[#4a2036] to-[#2e1626]" />
        <PhoneCard className="-ml-5 rotate-[9deg] bg-gradient-to-b from-[#14202e] to-[#101722]" />
      </div>
    </section>
  );
}

function PhoneCard({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-40 w-24 flex-col items-center gap-1.5 rounded-xl p-2.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/10 ${className ?? ""}`}
    >
      <div className="mt-1 h-1.5 w-4/5 rounded-full bg-white/80" />
      <div className="h-1.5 w-3/5 rounded-full bg-white/55" />
      <div className="mt-1.5 w-full flex-1 rounded-lg bg-white/10" />
    </div>
  );
}
