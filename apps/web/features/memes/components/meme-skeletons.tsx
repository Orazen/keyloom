import { Skeleton } from "@workspace/ui/components/skeleton";

export function GallerySkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-48 rounded-full sm:w-56" />
          <Skeleton className="h-9 w-40 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-44 w-full rounded-2xl" />

      <div className="flex items-center gap-2">
        {["all", "a", "b", "c"].map((k) => (
          <Skeleton key={k} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed static placeholders
            key={i}
            className="aspect-[9/16] w-full rounded-xl"
          />
        ))}
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
