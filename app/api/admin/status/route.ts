import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import { readCatalog, resolveEditionStorageRoot } from "@/lib/server/catalog";
import { getDirectorySizeBytes } from "@/lib/server/edition-storage";
import { CURRENT_EDITION_DIR } from "@/lib/server/paths";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  const catalog = await readCatalog();

  const editions = await Promise.all(
    catalog.editions.map(async (e) => {
      const storageRoot = await resolveEditionStorageRoot(e.id);
      const storageBytes = storageRoot
        ? await getDirectorySizeBytes(storageRoot)
        : 0;
      return {
        ...e,
        isCurrent: e.id === catalog.currentEditionId,
        storageRoot,
        storageBytes,
        storageMb: Math.round((storageBytes / 1024 / 1024) * 100) / 100,
      };
    }),
  );

  return NextResponse.json({
    currentEditionId: catalog.currentEditionId,
    currentEditionPath: CURRENT_EDITION_DIR,
    editions,
    accessRules: {
      currentEdition: "Full read via /read (session-protected WebP)",
      archiveEditions: "Cover image + metadata only",
      pdfDownload: "Disabled — source PDF never stored",
    },
  });
}
