import type { PublicPdfEdition } from "@/lib/types/pdf-magazine";

type PdfEmbedProps = {
  edition: PublicPdfEdition;
  className?: string;
};

export function PdfEmbed({ edition, className = "" }: PdfEmbedProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-white shadow-lg ${className}`}>
      <iframe
        src={edition.pdfUrl}
        title={edition.title}
        className="h-[min(80vh,900px)] w-full"
      />
    </div>
  );
}
