import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

const VIDEO_EXT = /\.(webm|mp4|mov|m4v)$/i;
const AUDIO_EXT = /\.(mp3|m4a|wav|ogg|aac|flac)$/i;

export type R2Video = { id: string; title: string; key: string };
export type R2ListResult = {
  videos: R2Video[];
  configured: boolean;
  error?: string;
};
export type R2AudioResult = {
  tracks: R2Video[];
  configured: boolean;
  error?: string;
};

function env(name: string): string | null {
  const v = process.env[name]?.trim();
  return v ? v : null;
}

function titleCase(base: string): string {
  const words = base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return words.replace(/\b\w/g, (c) => c.toUpperCase()) || base || "Video";
}

export async function listR2Audio(prefix: string): Promise<R2AudioResult> {
  const { videos, configured, error } = await listR2Objects(
    prefix,
    AUDIO_EXT,
    titleCase,
  );
  return { tracks: videos, configured, error };
}

export async function listR2Videos(
  prefix: string,
  titleize: (base: string) => string = titleCase,
): Promise<R2ListResult> {
  return listR2Objects(prefix, VIDEO_EXT, titleize);
}

async function listR2Objects(
  prefix: string,
  ext: RegExp,
  titleize: (base: string) => string,
): Promise<R2ListResult> {
  const accountId = env("R2_ACCOUNT_ID");
  const accessKeyId = env("R2_ACCESS_KEY_ID");
  const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
  // Fallback is the real R2 bucket name, not branding — it survives the
  // Keyloom rename until the bucket itself is migrated.
  const bucket = env("R2_BUCKET") ?? "keyloom";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return { videos: [], configured: false };
  }

  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const videos: R2Video[] = [];
    let ContinuationToken: string | undefined;
    do {
      const out = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken,
        }),
      );
      for (const obj of out.Contents ?? []) {
        const key = obj.Key;
        if (!key || key.endsWith("/") || !ext.test(key)) continue;
        const base = (key.split("/").pop() ?? key).replace(ext, "");
        videos.push({ id: base, title: titleize(base), key });
      }
      ContinuationToken = out.IsTruncated
        ? out.NextContinuationToken
        : undefined;
    } while (ContinuationToken);

    videos.sort((a, b) => a.title.localeCompare(b.title));
    return { videos, configured: true };
  } catch (err) {
    console.error(`Failed to list R2 videos under "${prefix}":`, err);
    return { videos: [], configured: true, error: "Failed to list bucket" };
  }
}
