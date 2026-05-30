export type PdfEdition = {
  id: string;
  title: string;
  fileName: string;
  pdfUrl: string;
  blobPathname: string;
  fileSize: number;
  uploadedAt: string;
};

export type PdfMagazineCatalog = {
  activeEditionId: string | null;
  editions: PdfEdition[];
};

export type PublicPdfEdition = PdfEdition & {
  isActive: boolean;
};
