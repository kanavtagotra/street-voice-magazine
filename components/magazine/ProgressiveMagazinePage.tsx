"use client";

import { useEffect, useRef, useState } from "react";
import { PageWatermark } from "@/components/magazine/PageWatermark";
import { pickPageUrl, useReaderVariant } from "@/hooks/useReaderVariant";
import type { ReaderPageAssets } from "@/lib/server/magazine-access";

type ProgressiveMagazinePageProps = {
  assets: ReaderPageAssets;
  alt: string;
  watermark: string;
  priority?: boolean;
  active?: boolean;
  onVisible?: () => void;
};

export function ProgressiveMagazinePage({
  assets,
  alt,
  watermark,
  priority = false,
  active = false,
  onVisible,
}: ProgressiveMagazinePageProps) {
  const variant = useReaderVariant();
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(priority);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  const shouldLoad = priority || active || inView;
  const fullSrc = pickPageUrl(assets, variant);

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
          observer.disconnect();
        }
      },
      { rootMargin: "280px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, active, onVisible]);

  return (
    <div ref={rootRef} className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
      {!shouldLoad ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />
      ) : (
        <>
          {/* Low-res progressive placeholder */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.thumb}
            alt=""
            aria-hidden
            className={`absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-500 ${
              fullLoaded ? "opacity-0" : thumbLoaded ? "opacity-90" : "opacity-40"
            }`}
            draggable={false}
            decoding="async"
            onLoad={() => setThumbLoaded(true)}
          />

          {/* Full resolution */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullSrc}
            srcSet={assets.srcSet}
            sizes={assets.sizes}
            alt={alt}
            className={`relative z-[1] h-full w-full object-contain transition-opacity duration-500 ${
              fullLoaded ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            onLoad={() => setFullLoaded(true)}
          />

          <PageWatermark label={watermark} />
        </>
      )}
    </div>
  );
}
