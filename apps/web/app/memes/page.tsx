import { Suspense } from "react";
import { GallerySkeleton } from "@/features/memes/components/meme-skeletons";
import { MemeStudio } from "@/features/memes/components/meme-studio";

export default function MemesPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <MemeStudio />
    </Suspense>
  );
}
