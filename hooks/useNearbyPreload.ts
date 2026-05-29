"use client";

import { useEffect } from "react";
import type { ReaderPageAssets } from "@/lib/server/magazine-access";
import { PRELOAD_RADIUS } from "@/lib/magazine-assets";
import { pickPageUrl } from "@/hooks/useReaderVariant";
import type { PageVariant } from "@/lib/magazine-assets";

export function useNearbyPreload(
  pages: ReaderPageAssets[] | undefined,
  pageIndex: number,
  variant: PageVariant,
  radius = PRELOAD_RADIUS,
) {
  useEffect(() => {
    if (!pages?.length) return;

    const links: HTMLLinkElement[] = [];

    for (let offset = -radius; offset <= radius; offset++) {
      if (offset === 0) continue;
      const target = pages[pageIndex + offset];
      if (!target) continue;

      const href = pickPageUrl(target, variant);
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      links.push(link);

      const thumb = document.createElement("link");
      thumb.rel = "preload";
      thumb.as = "image";
      thumb.href = target.thumb;
      document.head.appendChild(thumb);
      links.push(thumb);
    }

    return () => {
      links.forEach((link) => link.remove());
    };
  }, [pages, pageIndex, variant, radius]);
}
