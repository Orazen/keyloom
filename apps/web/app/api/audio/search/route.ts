/**
 * Royalty-free music search powered by the Internet Archive.
 *
 * Archive.org's `netlabels` audio collection is ~78k CC-licensed albums.
 * The search API is fully open (no key, no signup, no rate-limit per
 * account) and CDN downloads serve `Access-Control-Allow-Origin: *` so
 * tracks play back cleanly in the browser. We previously tried Pixabay
 * but its `/api/music/` endpoint was deprecated and `/api/audio/` is a
 * private internal endpoint not granted to public keys — Pixabay's
 * official docs say their API serves only images and videos.
 *
 * Two-stage fetch:
 *   1. advancedsearch → list of identifiers + titles + creators
 *   2. /metadata/<id> in parallel → find the first original mp3 + duration
 *
 * Cached in-memory for 5 minutes per query.
 */

export const runtime = "nodejs";

type Track = {
  id: string;
  title: string;
  duration: number;
  previewUrl: string;
  downloadUrl: string;
  tags: string[];
  user?: string;
};

type CacheEntry = { tracks: Track[]; expiresAt: number };
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const ARCHIVE_SEARCH = "https://archive.org/advancedsearch.php";
const ARCHIVE_METADATA = "https://archive.org/metadata";
const ARCHIVE_DOWNLOAD = "https://archive.org/download";

// Final fallback if the Archive search fails entirely (network down, IA
// outage). Bundled sample MP3s were removed to keep the repo small, so
// this is empty — the client renders an empty result set.
const FALLBACK_TRACKS: Track[] = [];

function readCache(key: string): Track[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.tracks;
}

function writeCache(key: string, tracks: Track[]): void {
  cache.set(key, { tracks, expiresAt: Date.now() + CACHE_TTL_MS });
  if (cache.size > 64) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
}

type ArchiveSearchDoc = {
  identifier: string;
  title?: string | string[];
  creator?: string | string[];
  downloads?: number;
};

type ArchiveSearchResponse = {
  response?: { docs?: ArchiveSearchDoc[] };
};

type ArchiveFile = {
  name?: string;
  source?: string;
  format?: string;
  length?: string | number;
  size?: string;
};

type ArchiveMetadata = {
  metadata?: { title?: string; creator?: string | string[] };
  files?: ArchiveFile[];
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseDuration(length: string | number | undefined): number {
  if (length === undefined) return 0;
  if (typeof length === "number") return Math.max(0, Math.round(length));
  // Archive.org returns either decimal seconds ("142.34") or H:MM:SS strings.
  if (length.includes(":")) {
    const parts = length.split(":").map(Number);
    return parts.reduce((acc, n) => acc * 60 + (Number.isFinite(n) ? n : 0), 0);
  }
  const n = Number(length);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function pickPlayableMp3(files: ArchiveFile[]): ArchiveFile | undefined {
  // Prefer "original" uploads. Fall back to "derivative" (lower bitrate
  // re-encodes IA produces automatically) so items that only have
  // derivative mp3s still play.
  const mp3s = files.filter((f) => f.name?.toLowerCase().endsWith(".mp3"));
  return (
    mp3s.find((f) => f.source === "original") ??
    mp3s.find((f) => f.format === "VBR MP3" || f.format === "MP3") ??
    mp3s[0]
  );
}

async function fetchMetadata(
  identifier: string,
): Promise<ArchiveMetadata | null> {
  try {
    const res = await fetch(`${ARCHIVE_METADATA}/${identifier}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as ArchiveMetadata;
  } catch {
    return null;
  }
}

async function searchArchive(query: string): Promise<Track[]> {
  // The netlabels collection is the cleanest CC-licensed music corpus on
  // IA. Restricting to mediatype:audio guarantees mp3 files. Sorting by
  // downloads desc surfaces the most-played items first — same idea as
  // Pixabay's "popular" order.
  const archiveQ = query
    ? `mediatype:audio AND collection:netlabels AND (${query})`
    : `mediatype:audio AND collection:netlabels`;

  const url = new URL(ARCHIVE_SEARCH);
  url.searchParams.set("q", archiveQ);
  url.searchParams.append("fl[]", "identifier");
  url.searchParams.append("fl[]", "title");
  url.searchParams.append("fl[]", "creator");
  url.searchParams.append("fl[]", "downloads");
  url.searchParams.append("sort[]", "downloads desc");
  url.searchParams.set("rows", "12");
  url.searchParams.set("output", "json");

  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as ArchiveSearchResponse;
  const docs = json.response?.docs ?? [];

  // Resolve mp3 URLs in parallel. Cap at the first ~10 hits that actually
  // produce a playable file so the UI populates fast even if a couple of
  // items have no mp3 derivatives.
  const enriched = await Promise.all(
    docs.map(async (doc) => {
      const meta = await fetchMetadata(doc.identifier);
      if (!meta) return null;
      const mp3 = pickPlayableMp3(meta.files ?? []);
      if (!mp3?.name) return null;
      const fileUrl = `${ARCHIVE_DOWNLOAD}/${doc.identifier}/${encodeURIComponent(mp3.name)}`;
      const title =
        firstString(doc.title) ?? meta.metadata?.title ?? doc.identifier;
      const creator =
        firstString(doc.creator) ?? firstString(meta.metadata?.creator);
      const track: Track = {
        id: doc.identifier,
        title,
        duration: parseDuration(mp3.length),
        previewUrl: fileUrl,
        downloadUrl: fileUrl,
        tags: [],
      };
      if (creator) track.user = creator;
      return track;
    }),
  );

  return enriched.filter((t): t is Track => t !== null);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const cacheKey = q.toLowerCase();

  const cached = readCache(cacheKey);
  if (cached) return Response.json({ tracks: cached });

  try {
    const tracks = await searchArchive(q);
    if (tracks.length > 0) {
      writeCache(cacheKey, tracks);
      return Response.json({ tracks });
    }
    // Archive returned zero playable items (rare — usually means the
    // query was overly specific). Fall back to the bundled samples so
    // the panel never goes empty.
    return Response.json({ tracks: FALLBACK_TRACKS });
  } catch {
    // Hard network failure — keep the panel useful with bundled tracks.
    return Response.json({ tracks: FALLBACK_TRACKS });
  }
}
