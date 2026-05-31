import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Container } from "@/components/layout/Container";
import { GradientHero } from "@/components/layout/GradientHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAllPdfEditions } from "@/lib/server/pdf-magazine-store";

export const metadata = {
  title: "Archive",
  description: "Browse all previously published Street Voice Magazine editions.",
};

export default async function ArchivePage() {
  const editions = await getAllPdfEditions();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GradientHero>
        <Header />
        <section className="pb-12 pt-6 sm:pb-16">
          <Container>
            <SectionHeader
              onHero
              eyebrow="Archive"
              title="Previous editions"
              description="Every uploaded issue remains available here. The active edition is marked below."
            />
          </Container>
        </section>
      </GradientHero>

      <main className="py-12 sm:py-16">
        <Container>
          {editions.length === 0 ? (
            <p className="text-sm text-muted">No editions have been published yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {editions.map((edition) => (
                <li
                  key={edition.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-md shadow-zinc-300/10 dark:shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{edition.title}</h2>
                    {edition.isActive ? (
                      <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {new Date(edition.uploadedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={edition.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950"
                    >
                      View PDF
                    </a>
                    {edition.isActive ? (
                      <Link
                        href="/#latest"
                        className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-card-muted"
                      >
                        On home page
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
