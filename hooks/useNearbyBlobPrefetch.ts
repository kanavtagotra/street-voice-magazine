"use client";

import { useEffect } from "react";
import type { PageVariant } from "@/lib/magazine-assets";
import { PRELOAD_RADIUS } from "@/lib/magazine-assets";
import { fetchReaderPageBlob } from "@/lib/reader/fetch-page";

export function useNearbyBlobPrefetch(
  pageNumbers: number[] | undefined,
  pageIndex: number,
  variant: PageVariant,
  radius = PRELOAD_RADIUS,
) {
  useEffect(() => {
    if (!pageNumbers?.length) return;

    for (let offset = -radius; offset <= radius; offset++) {
      if (offset === 0) continue;
      const target = pageNumbers[pageIndex + offset];
      if (!target) continue;

      fetchReaderPageBlob(target, variant).catch(() => {});
      fetchReaderPageBlob(target, "thumb").catch(() => {});
    }
  }, [pageNumbers, pageIndex, variant, radius]);
}
