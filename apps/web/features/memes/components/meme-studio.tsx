"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import {
  type MemeTemplate,
  memeAsset,
  memeTemplates,
} from "@/features/memes/lib/memes";
import { loadMemeFonts } from "../lib/meme-fonts";
import { EditorSkeleton, GallerySkeleton } from "./meme-skeletons";
import { MemeSurf } from "./meme-surf";

// Lazy so the Konva-heavy editor bundle loads only when a template is opened.
const MemeEditor = dynamic(
  () => import("./meme-editor").then((m) => m.MemeEditor),
  { ssr: false, loading: () => <EditorSkeleton /> },
);

type TemplateListItem = { id: string; title: string; key: string };

async function fetchMemeTemplates(): Promise<MemeTemplate[]> {
  const res = await fetch("/api/meme-templates");
  if (!res.ok) throw new Error(`Templates request failed: ${res.status}`);
  const data: { templates?: TemplateListItem[] } = await res.json();
  if (!data.templates?.length) return memeTemplates;
  return data.templates.map((t) => ({
    id: t.id,
    title: t.title,
    src: memeAsset(t.key),
    width: 1080,
    height: 1920,
    hasAudio: false,
  }));
}

export function MemeStudio() {
  const [templateId, setTemplateId] = useQueryState(
    "t",
    parseAsString.withOptions({ history: "push" }),
  );
  const [caption, setCaption] = useState("");

  useEffect(() => {
    loadMemeFonts();
  }, []);

  const { data: templates, isPending } = useQuery({
    queryKey: ["meme-templates"],
    queryFn: fetchMemeTemplates,
    staleTime: 5 * 60 * 1000,
  });

  const list = templates ?? memeTemplates;
  const selected = templateId
    ? list.find((t) => t.id === templateId)
    : undefined;

  if (templateId && isPending) {
    return (
      <div className="px-5 py-6 sm:px-8 lg:px-10">
        <EditorSkeleton />
      </div>
    );
  }
  if (selected) {
    return (
      <div className="px-5 py-6 sm:px-8 lg:px-10">
        <MemeEditor
          template={selected}
          initialCaption={caption}
          onBack={() => setTemplateId(null)}
        />
      </div>
    );
  }
  if (isPending) return <GallerySkeleton />;
  return (
    <div className="px-3 pb-3">
      <MemeSurf
        templates={list}
        caption={caption}
        onCaptionChange={setCaption}
        onSelect={(t) => setTemplateId(t.id)}
      />
    </div>
  );
}
