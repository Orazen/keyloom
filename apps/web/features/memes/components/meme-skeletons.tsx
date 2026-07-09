import { Skeleton } from "@workspace/ui/components/skeleton";

export function GallerySkeleton() {
  return (
    <div className="px-5 pb-5 pt-4 sm:px-8 lg:px-10">
      <div className="flex min-h-[calc(100dvh-5.25rem)] flex-col">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex items-center gap-1.5">
            {["hot", "a", "b"].map((k) => (
              <Skeleton key={k} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center gap-6 pb-16 pt-4">
          <Skeleton className="hidden h-[min(42vh,380px)] rounded-3xl [aspect-ratio:9/16] lg:block" />
          <Skeleton className="h-[min(58vh,540px)] rounded-[1.75rem] [aspect-ratio:9/16]" />
          <Skeleton className="hidden h-[min(42vh,380px)] rounded-3xl [aspect-ratio:9/16] lg:block" />
        </div>

        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed static placeholders
              key={i}
              className="h-14 w-9 rounded-lg"
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
