import { NextRequest, NextResponse } from "next/server";
import { readCatalog } from "@/lib/server/catalog";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const catalog = await readCatalog();
  return NextResponse.json(catalog);
}
