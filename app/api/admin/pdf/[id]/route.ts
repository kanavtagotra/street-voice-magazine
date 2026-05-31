import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import { deletePdfEdition } from "@/lib/server/pdf-magazine-store";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const { id } = await context.params;
  const deleted = await deletePdfEdition(id);

  if (!deleted) {
    return NextResponse.json({ error: "Edition not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Edition deleted." });
}
