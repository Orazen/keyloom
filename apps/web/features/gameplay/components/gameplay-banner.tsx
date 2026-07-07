import { GameController03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function GameplayBanner({ count }: { count: number }) {
  return (
    <section className="flex items-center justify-between gap-8 overflow-hidden rounded-2xl bg-[#0e0e12] p-6 text-white sm:p-8">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          Gameplay backgrounds
        </p>
        <h2 className="mt-2 text-pretty font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {count > 0 ? `${count} clips` : "Clips"} for the split-screen scroll.
        </h2>
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-white/60">
          Vertical, no-copyright gameplay loops — Minecraft, Subway Surfers,
          GTA. Drop one under a meme for that retention-bait split screen.
        </p>
      </div>

      <div className="hidden shrink-0 items-center pr-4 lg:flex">
        <PhoneCard className="-rotate-6 bg-gradient-to-b from-[#1d4d2a] to-[#143521]" />
        <PhoneCard className="-ml-5 rotate-3 bg-gradient-to-b from-[#203a4a] to-[#16232e]" />
        <PhoneCard className="-ml-5 rotate-[9deg] bg-gradient-to-b from-[#3a2a14] to-[#221a10]" />
        <div className="pointer-events-none -ml-16 flex size-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
          <HugeiconsIcon icon={GameController03Icon} size={26} />
        </div>
      </div>
    </section>
  );
}

function PhoneCard({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-40 w-24 flex-col items-center gap-1.5 rounded-xl p-2.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/10 ${className ?? ""}`}
    >
      <div className="mt-1.5 w-full flex-1 rounded-lg bg-white/10" />
      <div className="h-1.5 w-3/5 rounded-full bg-white/70" />
    </div>
  );
}
