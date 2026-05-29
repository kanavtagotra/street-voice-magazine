"use client";

import { useEffect, useState } from "react";
import type { PageVariant } from "@/lib/magazine-assets";

function variantForWidth(width: number): PageVariant {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function useReaderVariant(): PageVariant {
  const [variant, setVariant] = useState<PageVariant>("mobile");

  useEffect(() => {
    const update = () => setVariant(variantForWidth(window.innerWidth));
    update();

    const mqMobile = window.matchMedia("(max-width: 639px)");
    const mqTablet = window.matchMedia("(max-width: 1023px)");

    const onChange = () => update();
    mqMobile.addEventListener("change", onChange);
    mqTablet.addEventListener("change", onChange);
    return () => {
      mqMobile.removeEventListener("change", onChange);
      mqTablet.removeEventListener("change", onChange);
    };
  }, []);

  return variant;
}

export function pickPageUrl(
  assets: { thumb: string; mobile: string; tablet: string; desktop: string },
  variant: PageVariant,
) {
  if (variant === "thumb") return assets.thumb;
  return assets[variant];
}
