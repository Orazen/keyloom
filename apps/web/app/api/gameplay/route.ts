import { NextResponse } from "next/server";
import { listR2Videos } from "@/lib/r2-videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const prefix = process.env.R2_GAMEPLAY_PREFIX?.trim() || "gameplay/";
  const { videos, configured, error } = await listR2Videos(prefix);
  return NextResponse.json({ videos, configured, error });
}
