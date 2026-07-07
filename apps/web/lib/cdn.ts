const CDN = (
  process.env.NEXT_PUBLIC_MEME_CDN ?? "https://cdn.yoursite.com"
).replace(/\/$/, "");

const DIRECT = process.env.NEXT_PUBLIC_MEME_DIRECT === "1";

export function cdnAsset(path: string): string {
  const direct = `${CDN}/${path.replace(/^\//, "")}`;
  return DIRECT ? direct : `/api/meme-asset?u=${encodeURIComponent(direct)}`;
}
