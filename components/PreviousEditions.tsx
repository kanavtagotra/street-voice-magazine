import { CoverCard } from "@/components/layout/CoverCard";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getArchiveEditions } from "@/lib/server/catalog";
import { archiveNotice } from "@/lib/data";

export async function ArchiveSection() {
  const archive = await getArchiveEditions();

  return (
    <section id="archive" className="scroll-mt-28 py-16 sm:py-24">
      <Container className="space-y-10">
        <SectionHeader
          eyebrow="Archive"
          title="Previous Editions"
          description={archiveNotice}
        />

        {archive.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted">
            When a new edition is published, previous issues will appear here as
            cover previews with edition details.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {archive.map((edition) => (
              <article
                key={edition.id}
                className="group rounded-2xl border border-border bg-card p-4 shadow-lg shadow-zinc-300/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-xl dark:shadow-black/20 dark:hover:border-white/20"
              >
                <CoverCard
                  src={edition.coverUrl}
                  srcSet={edition.coverSrcSet}
                  alt={`${edition.title} cover`}
                />
                <div className="mt-4 space-y-2 px-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400/90">
                    {edition.title}
                  </p>
                  <h3 className="text-base font-semibold text-foreground">{edition.headline}</h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                    {edition.summary}
                  </p>
                  <span className="inline-flex rounded-full border border-border bg-card-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Cover preview only
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/** @alias ArchiveSection */
export const PreviousEditions = ArchiveSection;
