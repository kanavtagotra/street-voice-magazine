"use client";

import { useEffect, useRef, useState } from "react";
import { PageWatermark } from "@/components/magazine/PageWatermark";
import { usePageBlob } from "@/hooks/usePageBlob";
import { useReaderVariant } from "@/hooks/useReaderVariant";
import type { PageVariant } from "@/lib/magazine-assets";
import { fetchReaderPageBlob } from "@/lib/reader/fetch-page";

type SecureMagazinePageProps = {
  page: number;
  alt: string;
  watermark: string;
  enabled: boolean;
  priority?: boolean;
  active?: boolean;
  scale?: number;
  onVisible?: () => void;
  transitionDirection?: "left" | "right" | null;
};

export function SecureMagazinePage({
  page,
  alt,
  watermark,
  enabled,
  priority = false,
  active = false,
  scale = 1,
  onVisible,
  transitionDirection = null,
}: SecureMagazinePageProps) {
  const variant = useReaderVariant();
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(priority);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [fullVisible, setFullVisible] = useState(false);

  const shouldLoad = enabled && (priority || active || inView);
  const { blobUrl, loading } = usePageBlob(page, variant, shouldLoad);

  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    fetchReaderPageBlob(page, "thumb")
      .then((url) => {
        if (!cancelled) setThumbUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [page, shouldLoad]);

  useEffect(() => {
    if (priority || active) {
      setInView(true);
      return;
    }

    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          onVisible?.();
        }
      },
      { rootMargin: "320px 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, active, onVisible]);

  useEffect(() => {
    if (blobUrl) {
      const t = requestAnimationFrame(() => setFullVisible(true));
      return () => cancelAnimationFrame(t);
    }
    setFullVisible(false);
  }, [blobUrl]);

  const slideClass =
    transitionDirection === "left"
      ? "animate-slide-from-right"
      : transitionDirection === "right"
        ? "animate-slide-from-left"
        : "";

  return (
    <div
      ref={rootRef}
      className={`relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 ${slideClass}`}
    >
      {!shouldLoad ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />
      ) : (
        <>
          {thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbUrl}
              alt=""
              aria-hidden
              className={`absolute inset-0 h-full w-full scale-110 object-cover blur-2xl transition-opacity duration-500 ${
                fullVisible ? "opacity-0" : "opacity-80"
              }`}
              draggable={false}
            />
          ) : null}

          {loading && !blobUrl ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
            </div>
          ) : null}

          {blobUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blobUrl}
              alt={alt}
              className={`relative z-[1] h-full w-full object-contain transition-opacity duration-500 ${
                fullVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
              }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : null}

          <PageWatermark label={watermark} />
        </>
      )}
    </div>
  );
}
