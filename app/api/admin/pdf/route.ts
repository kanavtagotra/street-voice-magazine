import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import { getActivePdfEdition } from "@/lib/server/pdf-magazine-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const active = await getActivePdfEdition();
  return NextResponse.json({ active });
}
