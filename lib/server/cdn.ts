/**
 * CDN-ready absolute URLs. Set CDN_URL or NEXT_PUBLIC_CDN_URL to your edge origin
 * (e.g. https://cdn.streetvoice.in) so magazine assets cache at the edge.
 */
export function cdnUrl(path: string): string {
  const base =
    process.env.CDN_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "") ??
    "";

  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const CDN_CACHE_PAGE =
  "public, max-age=31536000, stale-while-revalidate=86400, immutable";

export const CDN_CACHE_COVER =
  "public, max-age=604800, stale-while-revalidate=3600";

export function assetResponseHeaders(cacheControl: string) {
  return {
    "Content-Type": "image/webp",
    "Cache-Control": cacheControl,
    "CDN-Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": "inline",
    Vary: "Accept-Encoding",
  };
}
