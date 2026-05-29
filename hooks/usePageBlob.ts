"use client";

import { useEffect, useState } from "react";
import type { PageVariant } from "@/lib/magazine-assets";
import { fetchReaderPageBlob } from "@/lib/reader/fetch-page";

export function usePageBlob(
  page: number,
  variant: PageVariant,
  enabled: boolean,
) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setBlobUrl(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchReaderPageBlob(page, variant)
      .then((url) => {
        if (!cancelled) setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, variant, enabled]);

  return { blobUrl, loading, error };
}
