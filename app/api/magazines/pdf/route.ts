import { NextResponse } from "next/server";
import {
  getActivePdfEdition,
  getAllPdfEditions,
  getPdfArchive,
} from "@/lib/server/pdf-magazine-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "archive") {
    const archive = await getPdfArchive();
    return NextResponse.json({ archive });
  }

  if (scope === "all") {
    const editions = await getAllPdfEditions();
    return NextResponse.json({ editions });
  }

  const active = await getActivePdfEdition();
  return NextResponse.json({ active });
}
