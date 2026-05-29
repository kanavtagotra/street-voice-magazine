type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Light text for use on dark gradient hero */
  onHero?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  onHero = false,
}: SectionHeaderProps) {
  return (
    <div className="max-w-2xl space-y-3">
      <p
        className={`text-xs font-semibold uppercase tracking-[0.22em] ${
          onHero ? "text-red-700 dark:text-red-400" : "text-red-600 dark:text-red-400"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`text-3xl font-semibold tracking-tight sm:text-4xl ${
          onHero ? "text-zinc-900 dark:text-white" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`text-base leading-relaxed ${
            onHero ? "text-zinc-700 dark:text-zinc-400" : "text-muted"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
