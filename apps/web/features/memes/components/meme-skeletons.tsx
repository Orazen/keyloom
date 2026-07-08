import { Skeleton } from "@workspace/ui/components/skeleton";

export function GallerySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-52" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex items-center gap-1.5">
          {["all", "a", "b"].map((k) => (
            <Skeleton key={k} className="h-8 w-20 rounded-full" />
          ))}
          <Skeleton className="h-8 w-36 rounded-full sm:w-44" />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <Skeleton className="aspect-[9/15] w-full max-w-[360px] rounded-3xl" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed static placeholders
              key={i}
              className="h-[76px] w-full rounded-2xl"
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
