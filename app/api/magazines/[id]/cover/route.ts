import { NextRequest, NextResponse } from "next/server";
import { readEditionMeta, resolveEditionStorageRoot } from "@/lib/server/catalog";
import { assetResponseHeaders, CDN_CACHE_COVER } from "@/lib/server/cdn";
import { resolveCoverFile } from "@/lib/server/image-variants";
import type { CoverVariant } from "@/lib/magazine-assets";
import { COVER_VARIANTS } from "@/lib/magazine-assets";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function parseCoverVariant(value: string | null): CoverVariant {
  if (value && value in COVER_VARIANTS) {
    return value as CoverVariant;
  }
  return "mobile";
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const variant = parseCoverVariant(request.nextUrl.searchParams.get("v"));
  const meta = await readEditionMeta(id);

  if (!meta) {
    return NextResponse.json({ error: "Edition not found" }, { status: 404 });
  }

  const storageRoot = await resolveEditionStorageRoot(id);
  if (!storageRoot) {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }

  const file = await resolveCoverFile(storageRoot, variant);
  if (!file) {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }

  const etag = `"${meta.cacheVersion ?? meta.processedAt}-cover-${variant}"`;

  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: assetResponseHeaders(CDN_CACHE_COVER),
    });
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      ...assetResponseHeaders(CDN_CACHE_COVER),
      ETag: etag,
    },
  });
}
