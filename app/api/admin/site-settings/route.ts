import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import { readSiteSettings, writeSiteSettings, type SiteSettings } from "@/lib/server/site-settings";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const settings = await readSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const body = (await request.json()) as SiteSettings;
  const current = await readSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...body,
  };

  await writeSiteSettings(next);
  return NextResponse.json({ settings: next });
}
