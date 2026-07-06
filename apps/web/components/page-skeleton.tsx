import { Skeleton } from "@workspace/ui/components/skeleton";

export function PageSkeleton() {
  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((k) => (
          <Skeleton key={k} className="aspect-[4/5] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
