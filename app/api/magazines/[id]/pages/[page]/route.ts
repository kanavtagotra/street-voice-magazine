import { NextRequest, NextResponse } from "next/server";
import { readEditionMeta, resolveEditionStorageRoot } from "@/lib/server/catalog";
import { assetResponseHeaders } from "@/lib/server/cdn";
import { resolvePageFile } from "@/lib/server/image-variants";
import { isCurrentEdition } from "@/lib/server/magazine-access";
import type { PageVariant } from "@/lib/magazine-assets";
import { PAGE_VARIANTS } from "@/lib/magazine-assets";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; page: string }> };

function parseVariant(value: string | null): PageVariant {
  if (value && value in PAGE_VARIANTS) {
    return value as PageVariant;
  }
  return "desktop";
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id, page: pageParam } = await params;
  const pageNum = Number.parseInt(pageParam, 10);
  const variant = parseVariant(request.nextUrl.searchParams.get("v"));

  if (!Number.isFinite(pageNum) || pageNum < 1) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  const [meta, allowed, storageRoot] = await Promise.all([
    readEditionMeta(id),
    isCurrentEdition(id),
    resolveEditionStorageRoot(id),
  ]);

  if (!meta) {
    return NextResponse.json({ error: "Edition not found" }, { status: 404 });
  }

  if (!allowed) {
    return NextResponse.json(
      { error: "Only the current edition is available for reading" },
      { status: 403 },
    );
  }

  if (!storageRoot) {
    return NextResponse.json({ error: "Edition assets not found" }, { status: 404 });
  }

  if (pageNum > meta.pageCount) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const file = await resolvePageFile(storageRoot, pageNum, variant);
  if (!file) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const etag = `"${meta.cacheVersion ?? meta.processedAt}-${pageNum}-${variant}"`;

  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: assetResponseHeaders("private, max-age=3600"),
    });
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      ...assetResponseHeaders("private, max-age=3600"),
      ETag: etag,
    },
  });
}
