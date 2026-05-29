"use client";

import { useMemo } from "react";

/** Indices to mount in DOM — virtual window around active page */
export function useVirtualWindow(
  total: number,
  activeIndex: number,
  radius: number,
) {
  return useMemo(() => {
    const set = new Set<number>();
    for (let i = Math.max(0, activeIndex - radius); i <= Math.min(total - 1, activeIndex + radius); i++) {
      set.add(i);
    }
    return set;
  }, [total, activeIndex, radius]);
}
