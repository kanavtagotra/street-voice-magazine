type PageWatermarkProps = {
  label?: string;
};

export function PageWatermark({
  label = "STREET VOICE · Licensed Digital View",
}: PageWatermarkProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-10 p-8 opacity-[0.1]">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className="rotate-[-22deg] text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white sm:text-xs"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="absolute bottom-2 right-2 rounded bg-black/45 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/75">
        {label}
      </div>
    </div>
  );
}
