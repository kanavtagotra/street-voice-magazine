import type { ReactNode } from "react";

type GradientHeroProps = {
  children: ReactNode;
};

export function GradientHero({ children }: GradientHeroProps) {
  return (
    <div className="relative overflow-hidden transition-colors duration-300">
      {/* Light theme — soft editorial gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-zinc-50 to-blue-100 dark:hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(248,113,113,0.35),transparent_55%),radial-gradient(ellipse_at_100%_0%,rgba(96,165,250,0.3),transparent_50%)] dark:hidden" />
      <div className="absolute inset-0 bg-gradient-to-r from-red-200/40 via-transparent to-blue-200/35 dark:hidden" />

      {/* Dark theme — premium luxury gradient */}
      <div className="absolute inset-0 hidden bg-gradient-to-br from-red-950 via-zinc-950 to-blue-950 dark:block" />
      <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_0%_0%,rgba(220,38,38,0.4),transparent_55%),radial-gradient(ellipse_at_100%_0%,rgba(29,78,216,0.35),transparent_50%)] dark:block" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-red-800/50 via-transparent to-blue-800/45 dark:block" />

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-red-400/20 blur-3xl dark:bg-red-600/20" />
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/20" />
      <div className="relative">{children}</div>
    </div>
  );
}
