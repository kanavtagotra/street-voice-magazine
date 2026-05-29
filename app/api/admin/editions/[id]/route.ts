import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import {
  archiveEdition,
  deleteEditionStorage,
  removeEditionFromCatalog,
  replaceEditionCover,
  updateEditionMeta,
} from "@/lib/server/edition-admin";
import { toPublicEdition, readEditionMeta } from "@/lib/server/catalog";

export const runtime = "nodejs";

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
  };

  try {
    const meta = await updateEditionMeta(id, {
      title: body.title?.trim(),
      headline: body.headline?.trim(),
      summary: body.summary?.trim(),
    });
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
