import type { PageVariant } from "@/lib/magazine-assets";
import { getCachedBlob, setCachedBlob } from "@/lib/reader/page-cache";

export async function fetchReaderPageBlob(
  page: number,
  variant: PageVariant,
): Promise<string> {
  const cached = getCachedBlob(page, variant);
  if (cached) return cached;

  const res = await fetch(`/api/reader/page/${page}?v=${variant}`, {
    credentials: "include",
    cache: "force-cache",
  });

  if (!res.ok) {
    throw new Error(`Failed to load page ${page}`);
  }

  const blob = await res.blob();
  return setCachedBlob(page, variant, blob);
}
