import { NextRequest, NextResponse } from "next/server";
import { isEditionPublished, readEditionMeta } from "@/lib/server/catalog";
import { assetResponseHeaders } from "@/lib/server/cdn";
import { resolvePageFile } from "@/lib/server/image-variants";
import { isCurrentEdition } from "@/lib/server/magazine-access";
import { getEditionIdFromReaderCookie } from "@/lib/server/reader-session";
import type { PageVariant } from "@/lib/magazine-assets";
import { PAGE_VARIANTS } from "@/lib/magazine-assets";

export const runtime = "nodejs";

type Params = { params: Promise<{ page: string }> };

function parseVariant(value: string | null): PageVariant {
  if (value && value in PAGE_VARIANTS) return value as PageVariant;
  return "mobile";
}

export async function GET(request: NextRequest, { params }: Params) {
  const editionId = await getEditionIdFromReaderCookie();
  if (!editionId) {
    return NextResponse.json({ error: "Reader session required" }, { status: 401 });
  }

  const referer = request.headers.get("referer") ?? "";
  const host = request.headers.get("host") ?? "";
  if (host && referer && !referer.includes(host)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { page: pageParam } = await params;
  const pageNum = Number.parseInt(pageParam, 10);
  const variant = parseVariant(request.nextUrl.searchParams.get("v"));

  if (!Number.isFinite(pageNum) || pageNum < 1) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const [meta, allowed] = await Promise.all([
    readEditionMeta(editionId),
    isCurrentEdition(editionId),
  ]);

  if (!meta || !allowed || !isEditionPublished(meta)) {
    return NextResponse.json({ error: "Edition unavailable" }, { status: 403 });
  }

  if (pageNum > meta.pageCount) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const file = await resolvePageFile(editionId, pageNum, variant);
  if (!file) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const etag = `"${meta.cacheVersion ?? meta.processedAt}-r${pageNum}-${variant}"`;

  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: assetResponseHeaders("private, max-age=3600"),
    });
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      ...assetResponseHeaders("private, no-store, max-age=3600"),
      ETag: etag,
      "X-Robots-Tag": "noindex, noimageindex",
    },
  });
}
