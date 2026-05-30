import { Container } from "@/components/layout/Container";
import { PdfEmbed } from "@/components/magazine/PdfEmbed";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getActivePdfEdition } from "@/lib/server/pdf-magazine-store";

export async function LatestEdition() {
  const active = await getActivePdfEdition();

  return (
    <section id="latest" className="scroll-mt-28 py-16 sm:py-24">
      <Container>
        {!active ? (
          <SectionHeader
            eyebrow="Latest Edition"
            title="Coming soon"
            description="The current issue will appear here automatically after the admin uploads a new PDF."
          />
        ) : (
          <div className="space-y-8">
            <SectionHeader
              eyebrow="Latest Edition"
              title={active.title}
              description={`Published ${new Date(active.uploadedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`}
            />
            <PdfEmbed edition={active} />
            <div className="flex flex-wrap gap-3">
              <a
                href={active.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
              >
                Open full PDF
              </a>
              <a
                href="/archive"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-card-muted"
              >
                Browse archive
              </a>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
