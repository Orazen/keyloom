"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import {
  type MemeTemplate,
  memeAsset,
  memeTemplates,
} from "@/features/memes/lib/memes";
import { loadMemeFonts } from "../lib/meme-fonts";
import { MemeChart } from "./meme-chart";
import { EditorSkeleton, GallerySkeleton } from "./meme-skeletons";

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

  if (templateId && isPending) return <EditorSkeleton />;
  if (selected) {
    return (
      <MemeEditor template={selected} onBack={() => setTemplateId(null)} />
    );
  }
  if (isPending) return <GallerySkeleton />;
  return <MemeChart templates={list} onSelect={(t) => setTemplateId(t.id)} />;
}
