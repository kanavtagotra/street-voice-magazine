import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { archiveNotice } from "@/lib/data";
import { getPdfArchive } from "@/lib/server/pdf-magazine-store";

export async function ArchiveSection() {
  const archive = await getPdfArchive();

  return (
    <section id="archive" className="scroll-mt-28 border-t border-border bg-card-muted/40 py-16 sm:py-24">
      <Container>
        <SectionHeader
          eyebrow="Archive"
          title="Previous editions"
          description={archiveNotice}
        />

        {archive.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No archived editions yet.</p>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archive.slice(0, 3).map((edition) => (
              <li
                key={edition.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-md shadow-zinc-300/10 dark:shadow-black/20"
              >
                <h3 className="font-semibold">{edition.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {new Date(edition.uploadedAt).toLocaleDateString()}
                </p>
                <a
                  href={edition.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-red-600 dark:text-red-400"
                >
                  View PDF →
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/archive"
          className="mt-8 inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-card"
        >
          View full archive
        </Link>
      </Container>
    </section>
  );
}
