import { readCatalog } from "@/lib/server/catalog";
import { cdnUrl } from "@/lib/server/cdn";
import type { CoverVariant, PageVariant } from "@/lib/magazine-assets";
import { READER_SIZES } from "@/lib/magazine-assets";

export async function isCurrentEdition(editionId: string): Promise<boolean> {
  const catalog = await readCatalog();
  return catalog.currentEditionId === editionId;
}

function buildAssetQuery(variant: string, cacheVersion?: string) {
  const params = new URLSearchParams({ v: variant });
  if (cacheVersion) params.set("cv", cacheVersion);
  return params.toString();
}

export function pageImageUrl(
  editionId: string,
  pageNum: number,
  variant: PageVariant = "desktop",
  cacheVersion?: string,
) {
  const query = buildAssetQuery(variant, cacheVersion);
  return cdnUrl(`/api/magazines/${editionId}/pages/${pageNum}?${query}`);
}

export function coverImageUrl(
  editionId: string,
  variant: CoverVariant = "mobile",
  cacheVersion?: string,
) {
  const query = buildAssetQuery(variant, cacheVersion);
  return cdnUrl(`/api/magazines/${editionId}/cover?${query}`);
}

export function buildPageSrcSet(editionId: string, pageNum: number, cacheVersion?: string) {
  const mobile = pageImageUrl(editionId, pageNum, "mobile", cacheVersion);
  const tablet = pageImageUrl(editionId, pageNum, "tablet", cacheVersion);
  const desktop = pageImageUrl(editionId, pageNum, "desktop", cacheVersion);
  return `${mobile} 640w, ${tablet} 1024w, ${desktop} 1560w`;
}

export function buildCoverSrcSet(editionId: string, cacheVersion?: string) {
  const mobile = coverImageUrl(editionId, "mobile", cacheVersion);
  const tablet = coverImageUrl(editionId, "tablet", cacheVersion);
  const desktop = coverImageUrl(editionId, "desktop", cacheVersion);
  return `${mobile} 480w, ${tablet} 720w, ${desktop} 960w`;
}

export type ReaderPageAssets = {
  page: number;
  thumb: string;
  mobile: string;
  tablet: string;
  desktop: string;
  srcSet: string;
  sizes: string;
};

export function buildReaderPageAssets(
  editionId: string,
  pageNum: number,
  cacheVersion?: string,
): ReaderPageAssets {
  return {
    page: pageNum,
    thumb: pageImageUrl(editionId, pageNum, "thumb", cacheVersion),
    mobile: pageImageUrl(editionId, pageNum, "mobile", cacheVersion),
    tablet: pageImageUrl(editionId, pageNum, "tablet", cacheVersion),
    desktop: pageImageUrl(editionId, pageNum, "desktop", cacheVersion),
    srcSet: buildPageSrcSet(editionId, pageNum, cacheVersion),
    sizes: READER_SIZES,
  };
}
