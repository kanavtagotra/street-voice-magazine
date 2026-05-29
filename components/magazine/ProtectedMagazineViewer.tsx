"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MagazineProtection } from "@/components/magazine/MagazineProtection";
import { ReaderChrome } from "@/components/magazine/ReaderChrome";
import { SecureMagazinePage } from "@/components/magazine/SecureMagazinePage";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useNearbyBlobPrefetch } from "@/hooks/useNearbyBlobPrefetch";
import { useReaderVariant } from "@/hooks/useReaderVariant";
import { useVirtualWindow } from "@/hooks/useVirtualWindow";
import { clearPageCache } from "@/lib/reader/page-cache";
import { PRELOAD_RADIUS } from "@/lib/magazine-assets";

type BootstrapPayload = {
  edition: {
    id: string;
    title: string;
    headline: string;
    pageCount: number;
  };
  pages: number[];
  watermark: string;
  preloadRadius?: number;
};

export function ProtectedMagazineViewer() {
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const variant = useReaderVariant();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);

  const preloadRadius = data?.preloadRadius ?? PRELOAD_RADIUS;
  const total = data?.pages.length ?? 0;
  const virtualWindow = useVirtualWindow(total, pageIndex, preloadRadius);

  useEffect(() => {
    fetch("/api/reader/bootstrap", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) throw new Error("auth");
        if (!res.ok) throw new Error("edition");
        return res.json() as Promise<BootstrapPayload>;
      })
      .then(setData)
      .catch((err: Error) => {
        if (err.message === "auth") {
          setError("sign-in");
          return;
        }
        setError("No current edition is published yet.");
      })
      .finally(() => setLoading(false));

    return () => clearPageCache();
  }, []);

  useNearbyBlobPrefetch(data?.pages, pageIndex, variant, preloadRadius);

  const goTo = useCallback(
    (next: number) => {
      setPageIndex((prev) => {
        if (next === prev || next < 0 || next >= total) return prev;
        setSlideDir(next > prev ? "left" : "right");
        setScale(1);
        return next;
      });
    },
    [total],
  );

  const goPrev = useCallback(() => {
    setPageIndex((prev) => {
      const next = Math.max(0, prev - 1);
      if (next !== prev) setSlideDir("right");
      setScale(1);
      return next;
    });
  }, []);

  const goNext = useCallback(() => {
    setPageIndex((prev) => {
      const next = Math.min(total - 1, prev + 1);
      if (next !== prev) setSlideDir("left");
      setScale(1);
      return next;
    });
  }, [total]);

  useEffect(() => {
    if (slideDir === null) return;
    const t = setTimeout(() => setSlideDir(null), 320);
    return () => clearTimeout(t);
  }, [slideDir, pageIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "+" || event.key === "=") {
        setScale((s) => Math.min(3, s + 0.2));
      }
      if (event.key === "-") setScale((s) => Math.max(1, s - 0.2));
      if (event.key === "f" && !event.metaKey && !event.ctrlKey) {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, toggleFullscreen]);

  useEffect(() => {
    if (!data || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-page-index="${pageIndex}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [pageIndex, data]);

  const showChrome = () => {
    setChromeVisible(true);
    if (chromeTimer.current) clearTimeout(chromeTimer.current);
    chromeTimer.current = setTimeout(() => setChromeVisible(false), 3500);
  };

  useEffect(() => {
    showChrome();
    return () => {
      if (chromeTimer.current) clearTimeout(chromeTimer.current);
    };
  }, []);

  const onTouchStart = (event: React.TouchEvent) => {
    showChrome();
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      pinchStart.current = {
        distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        scale,
      };
      return;
    }
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && pinchStart.current) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = distance / pinchStart.current.distance;
      setScale(Math.min(3, Math.max(1, pinchStart.current.scale * ratio)));
    }
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    pinchStart.current = null;
    if (!touchStart.current || scale > 1.05) {
      touchStart.current = null;
      return;
    }
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 text-zinc-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
        <p className="text-sm">Opening protected reader…</p>
      </div>
    );
  }

  if (error || !data?.pages.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-300">
        <p>
          {error === "sign-in"
            ? "Sign in to read the current edition."
            : (error ?? "Edition unavailable")}
        </p>
        {error === "sign-in" ? (
          <Link
            href="/login?callbackUrl=/read"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950"
          >
            Sign in
          </Link>
        ) : null}
        <Link
          href="/"
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const pageNum = data.pages[pageIndex];
  const pageLabel = `Page ${pageIndex + 1} of ${total}`;

  return (
    <MagazineProtection>
      <div
        className="flex min-h-screen flex-col bg-zinc-950 text-white"
        onMouseMove={showChrome}
        onClick={showChrome}
      >
        <ReaderChrome
          title={data.edition.title}
          pageLabel={pageLabel}
          hidden={isFullscreen && !chromeVisible}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onZoomIn={() => setScale((s) => Math.min(3, s + 0.25))}
          onZoomOut={() => setScale((s) => Math.max(1, s - 0.25))}
          onPrev={goPrev}
          onNext={goNext}
          canPrev={pageIndex > 0}
          canNext={pageIndex < total - 1}
        />

        {/* Mobile: virtualized single-page carousel */}
        <main
          className="flex flex-1 flex-col lg:hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex flex-1 items-center justify-center px-3 py-4 sm:px-5">
            <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 shadow-2xl sm:rounded-2xl">
              <SecureMagazinePage
                key={`m-${pageIndex}-${variant}`}
                page={pageNum}
                alt={`${data.edition.title} page ${pageNum}`}
                watermark={data.watermark}
                enabled
                priority
                active
                scale={scale}
                transitionDirection={slideDir}
              />
            </div>
          </div>
          <p className="pb-4 text-center text-[11px] text-zinc-600">
            Swipe · Pinch to zoom · Protected session
          </p>
        </main>

        {/* Desktop: scroll + virtual window */}
        <main
          ref={scrollRef}
          className="hidden flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth lg:block"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-14 px-6 py-10">
            {data.pages.map((num, index) => {
              const mounted = virtualWindow.has(index);

              return (
                <div
                  key={num}
                  data-page-index={index}
                  className="snap-center min-h-[70vh]"
                  onClick={() => goTo(index)}
                >
                  {mounted ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                      <SecureMagazinePage
                        page={num}
                        alt={`${data.edition.title} page ${num}`}
                        watermark={data.watermark}
                        enabled
                        priority={index < 2}
                        active={index === pageIndex}
                        scale={index === pageIndex ? scale : 1}
                        onVisible={() => goTo(index)}
                      />
                    </div>
                  ) : (
                    <div
                      className="aspect-[3/4] w-full rounded-2xl bg-zinc-900/40"
                      aria-hidden
                    />
                  )}
                  <p className="mt-3 text-center text-sm text-zinc-600">
                    Page {num} of {total}
                  </p>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </MagazineProtection>
  );
}
