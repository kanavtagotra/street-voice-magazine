import { NextResponse } from "next/server";
import { getCurrentEdition, readEditionMeta } from "@/lib/server/catalog";
import { buildReaderPageAssets } from "@/lib/server/magazine-access";

export const runtime = "nodejs";

export async function GET() {
  const current = await getCurrentEdition();

  if (!current) {
    return NextResponse.json({ error: "No current edition published" }, { status: 404 });
  }

  const meta = await readEditionMeta(current.id);
  const cacheVersion = meta?.cacheVersion ?? meta?.processedAt;

  const pages = Array.from({ length: current.pageCount }, (_, i) =>
    buildReaderPageAssets(current.id, i + 1, cacheVersion),
  );

  return NextResponse.json(
    {
      edition: current,
      pages,
      watermark: "STREET VOICE · Licensed Digital View",
      preloadRadius: 2,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
    },
  );
}
