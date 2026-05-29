import { CoverCard } from "@/components/layout/CoverCard";
import { Container } from "@/components/layout/Container";
import { ReadAccessCTA } from "@/components/auth/ReadAccessCTA";
import {
  getCurrentEdition,
  isEditionPublished,
  readEditionMeta,
  toPublicEdition,
} from "@/lib/server/catalog";
import { readSiteSettings } from "@/lib/server/site-settings";
import { siteConfig } from "@/lib/data";

export async function Hero() {
  const settings = await readSiteSettings();
  const current = await getCurrentEdition();

  let featured = current;
  if (settings.featuredEditionId && settings.featuredEditionId !== current?.id) {
    const meta = await readEditionMeta(settings.featuredEditionId);
    if (meta && isEditionPublished(meta)) {
      featured = toPublicEdition(meta, meta.id === current?.id);
    }
  }

  const display = featured ?? current;
  const headline = settings.heroHeadline ?? siteConfig.heroHeadline;
  const tagline = settings.heroTagline ?? siteConfig.tagline;

  return (
    <section id="home" className="scroll-mt-24 pb-16 pt-6 sm:pb-24 sm:pt-10">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-up space-y-8">
            {display ? (
              <p className="inline-flex rounded-full border border-red-300/60 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-red-800 backdrop-blur-md dark:border-white/15 dark:bg-white/5 dark:text-red-200">
                {display.title}
              </p>
            ) : null}

            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl lg:leading-[1.02] dark:text-white">
                {headline}
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-zinc-700 sm:text-lg dark:text-white/75">
                {tagline}
              </p>
            </div>

            {current ? (
              <ReadAccessCTA onHero />
            ) : (
              <p className="text-sm text-muted">
                The latest edition will appear here after publication.
              </p>
            )}
          </div>

          <div className="animate-fade-up mx-auto w-full max-w-sm [animation-delay:120ms] sm:max-w-md lg:mx-0 lg:ml-auto lg:max-w-lg">
            {display ? (
              <CoverCard
                featured
                src={display.coverUrl}
                srcSet={display.coverSrcSet}
                alt={`${display.title} magazine cover`}
                priority
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-zinc-400/50 bg-white/50 text-sm text-muted backdrop-blur-sm dark:border-white/20 dark:bg-white/5">
                Magazine cover preview
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
