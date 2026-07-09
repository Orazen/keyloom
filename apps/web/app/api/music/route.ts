import { NextResponse } from "next/server";
import { listR2Audio } from "@/lib/r2-videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const prefix = process.env.R2_MUSIC_PREFIX?.trim() || "music/";
  const { tracks, configured, error } = await listR2Audio(prefix);
  return NextResponse.json({ tracks, configured, error });
}
