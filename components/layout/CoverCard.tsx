import { EditionCoverImage } from "@/components/EditionCoverImage";

type CoverCardProps = {
  src: string;
  srcSet?: string;
  alt: string;
  priority?: boolean;
  featured?: boolean;
};

export function CoverCard({
  src,
  srcSet,
  alt,
  priority = false,
  featured = false,
}: CoverCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl shadow-zinc-400/25 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-400/35 dark:border-white/10 dark:bg-white/5 dark:shadow-2xl dark:shadow-black/40 dark:hover:border-white/20 dark:hover:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] ${
        featured ? "ring-1 ring-zinc-200/80 dark:ring-white/15" : ""
      }`}
    >
      <div className="relative aspect-[3/4]">
        <EditionCoverImage
          src={src}
          srcSet={srcSet}
          alt={alt}
          priority={priority}
          className="transition duration-700 hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/15 via-transparent to-transparent dark:from-zinc-950/30" />
      </div>
    </div>
  );
}
