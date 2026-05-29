const STEPS = [
  "Admin uploads PDF via Google-authenticated dashboard",
  "Server validates file and processes pages",
  "Cover extracted from page 1",
  "All pages rendered and compressed to WebP variants",
  "Assets stored in Vercel Blob (production) or local storage (dev)",
  "Edition saved as draft or published immediately",
  "Published editions appear on the public site",
  "Current edition readable at /read for signed-in users",
] as const;

export function PipelineSteps() {
  return (
    <ol className="space-y-2">
      {STEPS.map((step, index) => (
        <li key={step} className="flex gap-3 text-sm text-muted">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card-muted text-xs font-semibold">
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}
