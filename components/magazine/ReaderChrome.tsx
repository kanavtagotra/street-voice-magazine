"use client";

import Link from "next/link";

type ReaderChromeProps = {
  title: string;
  pageLabel: string;
  hidden?: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
};

export function ReaderChrome({
  title,
  pageLabel,
  hidden = false,
  isFullscreen,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: ReaderChromeProps) {
  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl transition duration-300 ${
        hidden ? "-translate-y-full opacity-0 pointer-events-none" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400 sm:text-xs">
            {title}
          </p>
          <p className="truncate text-xs text-zinc-400 sm:text-sm">{pageLabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="rounded-full border border-white/15 px-2.5 py-1.5 text-xs disabled:opacity-40 sm:px-3"
            aria-label="Previous page"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="rounded-full border border-white/15 px-2.5 py-1.5 text-xs disabled:opacity-40 sm:px-3"
            aria-label="Next page"
          >
            ›
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="hidden rounded-full border border-white/15 px-2.5 py-1.5 text-sm sm:inline"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="hidden rounded-full border border-white/15 px-2.5 py-1.5 text-sm sm:inline"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="rounded-full border border-white/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide sm:px-3 sm:text-xs"
          >
            {isFullscreen ? "Exit FS" : "Fullscreen"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-2.5 py-1.5 text-[10px] font-semibold sm:px-3 sm:text-xs"
          >
            Exit
          </Link>
        </div>
      </div>
    </header>
  );
}
