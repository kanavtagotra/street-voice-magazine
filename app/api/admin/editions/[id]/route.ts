import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import {
  archiveEdition,
  deleteEditionStorage,
  publishEdition,
  removeEditionFromCatalog,
  replaceEditionCover,
  setCurrentEdition,
  unpublishEdition,
  updateEditionMeta,
} from "@/lib/server/edition-admin";
import { toPublicEdition, readEditionMeta } from "@/lib/server/catalog";
import { processPdfMagazine } from "@/lib/server/pdf-processor";
import type { EditionStatus } from "@/lib/types/magazine";

export const runtime = "nodejs";
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const admin = await requireAdminApi(_request);
  if (!admin) return forbiddenResponse();

  const { id } = await params;
  const meta = await readEditionMeta(id);
  if (!meta) {
    return NextResponse.json({ error: "Edition not found" }, { status: 404 });
  }

  const catalog = await import("@/lib/server/catalog").then((m) => m.readCatalog());
  const isCurrent = catalog.currentEditionId === id;

  return NextResponse.json({
    edition: toPublicEdition(meta, isCurrent),
    meta,
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    headline?: string;
    summary?: string;
    publishedAt?: string;
    status?: EditionStatus;
    setAsCurrent?: boolean;
  };

  try {
    if (body.setAsCurrent) {
      await setCurrentEdition(id);
    }

    if (body.status === "published") {
      await publishEdition(id);
    } else if (body.status === "draft") {
      await unpublishEdition(id);
    }

    const patch: Parameters<typeof updateEditionMeta>[1] = {};
    if (body.title !== undefined) patch.title = body.title.trim();
    if (body.headline !== undefined) patch.headline = body.headline.trim();
    if (body.summary !== undefined) patch.summary = body.summary.trim();
    if (body.publishedAt !== undefined) {
      patch.publishedAt = new Date(body.publishedAt).toISOString();
    }

    const meta =
      Object.keys(patch).length > 0 ? await updateEditionMeta(id, patch) : await readEditionMeta(id);

    return NextResponse.json({ success: true, meta });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const { id } = await params;
  const archiveOnly = request.nextUrl.searchParams.get("mode") !== "purge";

  try {
    if (archiveOnly) {
      await archiveEdition(id);
    } else {
      await removeEditionFromCatalog(id);
      await deleteEditionStorage(id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("cover");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Cover image is required" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Cover must be JPEG, PNG, or WebP" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const meta = await replaceEditionCover(id, buffer);
    return NextResponse.json({ success: true, meta });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cover update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const existing = await readEditionMeta(id);
    if (!existing) {
      return NextResponse.json({ error: "Edition not found" }, { status: 404 });
    }

    const catalog = await import("@/lib/server/catalog").then((m) => m.readCatalog());
    const setAsCurrent = catalog.currentEditionId === id;
    const pdfBuffer = Buffer.from(await file.arrayBuffer());

    const result = await processPdfMagazine({
      id,
      title: String(formData.get("title") ?? existing.title).trim() || existing.title,
      headline:
        String(formData.get("headline") ?? existing.headline).trim() || existing.headline,
      summary:
        String(formData.get("summary") ?? existing.summary).trim() || existing.summary,
      pdfBuffer,
      setAsCurrent,
      status: existing.status,
      publishedAt: existing.publishedAt,
      preservePublishedAt: true,
    });

    return NextResponse.json({
      success: true,
      edition: result.meta,
      stats: result.stats,
      log: result.log,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF replace failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
