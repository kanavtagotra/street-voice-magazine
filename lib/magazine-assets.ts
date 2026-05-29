export const PAGE_VARIANTS = {
  thumb: { width: 56, quality: 38, effort: 6 },
  mobile: { width: 640, quality: 78, effort: 5 },
  tablet: { width: 1024, quality: 80, effort: 5 },
  desktop: { width: 1560, quality: 82, effort: 4 },
} as const;

export const COVER_VARIANTS = {
  thumb: { width: 120, quality: 40, effort: 6 },
  mobile: { width: 480, quality: 80, effort: 5 },
  tablet: { width: 720, quality: 82, effort: 5 },
  desktop: { width: 960, quality: 85, effort: 4 },
} as const;

export type PageVariant = keyof typeof PAGE_VARIANTS;
export type CoverVariant = keyof typeof COVER_VARIANTS;

export const READER_SIZES =
  "(max-width: 639px) 100vw, (max-width: 1023px) 90vw, 900px";

export const PRELOAD_RADIUS = 2;
