import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import { readCatalog } from "@/lib/server/catalog";
import { getEditionStorageBytes, isBlobStorageEnabled } from "@/lib/server/asset-store";
import { CURRENT_EDITION_DIR } from "@/lib/server/paths";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const catalog = await readCatalog();

  const editions = await Promise.all(
    catalog.editions.map(async (e) => {
      const storageBytes = await getEditionStorageBytes(e.id);
      return {
        ...e,
        isCurrent: e.id === catalog.currentEditionId,
        storageBytes,
        storageMb: Math.round((storageBytes / 1024 / 1024) * 100) / 100,
      };
    }),
  );

  return NextResponse.json({
    currentEditionId: catalog.currentEditionId,
    storageBackend: isBlobStorageEnabled() ? "vercel-blob" : "local",
    currentEditionPath: isBlobStorageEnabled() ? null : CURRENT_EDITION_DIR,
    editions,
    accessRules: {
      currentEdition: "Published current edition readable at /read",
      archiveEditions: "Published archive: cover + metadata only",
      drafts: "Hidden from public site until published",
      pdfDownload: "Disabled — source PDF never stored",
    },
  });
}
