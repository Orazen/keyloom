import { NextResponse } from "next/server";
import { listR2Videos } from "@/lib/r2-videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TITLE_NOISE = /\b(meme|green screen|template)\b/gi;

function templateTitle(base: string): string {
  const words = base
    .replace(/[_-]+/g, " ")
    .replace(TITLE_NOISE, " ")
    .replace(/\s+/g, " ")
    .trim();
  return words.replace(/\b\w/g, (c) => c.toUpperCase()) || base || "Template";
}

export async function GET() {
  const prefix = process.env.R2_MEME_PREFIX?.trim() || "memes/";
  const { videos, configured, error } = await listR2Videos(
    prefix,
    templateTitle,
  );
  return NextResponse.json({ templates: videos, configured, error });
}
