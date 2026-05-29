import { siteConfig } from "@/lib/data";

type LogoProps = {
  className?: string;
  /** When true, logo sits on gradient hero (higher contrast in light mode). */
  onHero?: boolean;
};

export function Logo({ className = "", onHero = false }: LogoProps) {
  return (
    <a href="/#home" className={`group flex items-center gap-3 ${className}`}>
      <span className="h-9 w-1 rounded-full bg-gradient-to-b from-red-500 to-blue-600 transition group-hover:scale-y-110" />
      <span
        className={`text-sm font-semibold tracking-[0.14em] sm:text-base ${
          onHero
            ? "text-zinc-900 dark:text-white"
            : "text-foreground"
        }`}
      >
        {siteConfig.shortName.toUpperCase()}
      </span>
    </a>
  );
}
