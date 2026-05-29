const STEPS = [
  "Admin uploads PDF",
  "Server validates file",
  "Cover extracted from page 1",
  "All pages rendered with pdfjs + canvas",
  "Sharp compresses to WebP (thumb, mobile, tablet, desktop)",
  "Assets saved to secure storage/",
  "Previous edition demoted to archive (cover only)",
  "Current edition readable at /read",
] as const;

export function PipelineSteps() {
  return (
    <ol className="space-y-2">
      {STEPS.map((step, index) => (
        <li
          key={step}
          className="flex gap-3 text-sm text-zinc-400"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-zinc-300">
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}
