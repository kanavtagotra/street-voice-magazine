import { NextResponse } from "next/server";
import { getPdfEditionById, readLocalPdfFile } from "@/lib/server/pdf-magazine-store";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const edition = await getPdfEditionById(id);
  if (!edition) {
    return NextResponse.json({ error: "Edition not found" }, { status: 404 });
  }

  const file = await readLocalPdfFile(id);
  if (!file) {
    return NextResponse.redirect(edition.pdfUrl);
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${edition.fileName}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
