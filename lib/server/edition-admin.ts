import { promises as fs } from "fs";
import {
  readCatalog,
  readEditionMeta,
  resolveEditionStorageRoot,
  writeCatalog,
} from "@/lib/server/catalog";
import { generateCoverVariants } from "@/lib/server/image-variants";
import { editionMetaPath } from "@/lib/server/paths";
import type { EditionMetaFile } from "@/lib/types/magazine";

export async function updateEditionMeta(
  editionId: string,
  patch: Partial<Pick<EditionMetaFile, "title" | "headline" | "summary">>,
) {
  const storageRoot = await resolveEditionStorageRoot(editionId);
  if (!storageRoot) throw new Error("Edition not found");

  const meta = await readEditionMeta(editionId);
  if (!meta) throw new Error("Edition metadata not found");

  const updated: EditionMetaFile = {
    ...meta,
    ...patch,
    cacheVersion: new Date().toISOString(),
  };

  await fs.writeFile(editionMetaPath(storageRoot), JSON.stringify(updated, null, 2), "utf-8");

  const catalog = await readCatalog();
  const idx = catalog.editions.findIndex((e) => e.id === editionId);
  if (idx >= 0) {
    catalog.editions[idx] = {
      ...catalog.editions[idx],
      title: updated.title,
      headline: updated.headline,
      summary: updated.summary,
    };
    await writeCatalog(catalog);
  }

  return updated;
}

export async function replaceEditionCover(editionId: string, imageBuffer: Buffer) {
  const storageRoot = await resolveEditionStorageRoot(editionId);
  if (!storageRoot) throw new Error("Edition not found");

  await generateCoverVariants(storageRoot, imageBuffer);

  const meta = await readEditionMeta(editionId);
  if (meta) {
    const updated = { ...meta, cacheVersion: new Date().toISOString() };
    await fs.writeFile(editionMetaPath(storageRoot), JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  }

  return null;
}

export async function removeEditionFromCatalog(editionId: string) {
  const catalog = await readCatalog();
  const wasCurrent = catalog.currentEditionId === editionId;
  catalog.editions = catalog.editions.filter((e) => e.id !== editionId);
  if (wasCurrent) {
    catalog.currentEditionId = catalog.editions[0]?.id ?? null;
  }
  await writeCatalog(catalog);
  return { wasCurrent, newCurrentId: catalog.currentEditionId };
}

export async function deleteEditionStorage(editionId: string) {
  const storageRoot = await resolveEditionStorageRoot(editionId);
  if (storageRoot) {
    await fs.rm(storageRoot, { recursive: true, force: true });
  }
}

export async function archiveEdition(editionId: string) {
  return removeEditionFromCatalog(editionId);
}
