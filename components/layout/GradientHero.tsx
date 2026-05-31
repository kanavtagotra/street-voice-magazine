import type { ReactNode } from "react";

type GradientHeroProps = {
  children: ReactNode;
};

/**
 * Premium hero gradient — identical in light and dark site themes.
 * Theme toggle must not change these layers (no dark: variants on background).
 */
export function GradientHero({ children }: GradientHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-zinc-950 to-blue-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(220,38,38,0.4),transparent_55%),radial-gradient(ellipse_at_100%_0%,rgba(29,78,216,0.35),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-red-800/50 via-transparent to-blue-800/45" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
