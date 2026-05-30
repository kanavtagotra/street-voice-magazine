import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/guards";
import { getCurrentEdition, readEditionMeta } from "@/lib/server/catalog";
import {
  createReaderToken,
  READER_COOKIE,
  readerCookieOptions,
} from "@/lib/server/reader-session";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const current = await getCurrentEdition();
  if (!current) {
    return NextResponse.json({ error: "No current edition published" }, { status: 404 });
  }

  const meta = await readEditionMeta(current.id);
  const token = createReaderToken(current.id);

  const response = NextResponse.json({
    edition: {
      id: current.id,
      title: current.title,
      headline: current.headline,
      pageCount: current.pageCount,
    },
    pages: Array.from({ length: current.pageCount }, (_, i) => i + 1),
    watermark: `STREET VOICE · ${session.user.email ?? "Licensed View"}`,
    preloadRadius: 2,
    cacheVersion: meta?.cacheVersion ?? meta?.processedAt,
    preferences: {},
  });

  response.cookies.set(READER_COOKIE, token, readerCookieOptions());
  return response;
}
