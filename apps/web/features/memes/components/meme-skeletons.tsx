import { Skeleton } from "@workspace/ui/components/skeleton";

export function GallerySkeleton() {
  return (
    <div className="px-3 pb-3">
      <div className="flex min-h-[calc(100dvh-4.25rem)] flex-col rounded-3xl bg-[#0e0f13] px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-72 bg-white/10" />
            <Skeleton className="h-4 w-96 max-w-full bg-white/5" />
          </div>
          <div className="flex items-center gap-1.5">
            {["hot", "a", "b"].map((k) => (
              <Skeleton key={k} className="h-8 w-20 rounded-full bg-white/10" />
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center gap-6 pb-16 pt-4">
          <Skeleton className="hidden h-[min(42vh,380px)] rounded-3xl bg-white/5 [aspect-ratio:9/16] lg:block" />
          <Skeleton className="h-[min(58vh,540px)] rounded-[1.75rem] bg-white/10 [aspect-ratio:9/16]" />
          <Skeleton className="hidden h-[min(42vh,380px)] rounded-3xl bg-white/5 [aspect-ratio:9/16] lg:block" />
        </div>

        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed static placeholders
              key={i}
              className="h-14 w-9 rounded-lg bg-white/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-8 w-40 self-start rounded-full" />
        <Skeleton className="h-[70vh] w-full max-w-[420px] rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-md" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed static placeholders
            key={i}
            className="h-16 w-full rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
