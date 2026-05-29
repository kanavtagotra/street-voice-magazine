import { CoverCard } from "@/components/layout/CoverCard";
import { Container } from "@/components/layout/Container";
import { ReadAccessCTA } from "@/components/auth/ReadAccessCTA";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCurrentEdition } from "@/lib/server/catalog";

export async function LatestEdition() {
  const current = await getCurrentEdition();

  return (
    <section id="latest" className="scroll-mt-28 py-16 sm:py-24">
      <Container>
        {!current ? (
          <SectionHeader
            eyebrow="Latest Edition"
            title="Coming soon"
            description="The current issue will be published here. Check back after the editorial team uploads the new edition."
          />
        ) : (
          <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-6 shadow-xl shadow-zinc-300/30 backdrop-blur-md transition-colors duration-300 sm:p-10 dark:shadow-black/40 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <CoverCard
              src={current.coverUrl}
              srcSet={current.coverSrcSet}
              alt={`${current.title} cover`}
              priority
              featured
            />

            <div className="space-y-8">
              <SectionHeader
                eyebrow="Latest Edition"
                title={current.headline}
                description={current.summary}
              />

              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    Edition
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{current.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {current.pageCount} pages · Online reading only
                  </p>
                </div>
              </div>

              <ReadAccessCTA label="Read Online" />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
