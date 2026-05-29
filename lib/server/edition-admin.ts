import {
  deleteEditionAssets,
  writeEditionMeta,
} from "@/lib/server/asset-store";
import { generateCoverVariants } from "@/lib/server/image-variants";
import {
  readCatalog,
  readEditionMeta,
  resolveEditionStorageRoot,
  setEditionStatus,
  writeCatalog,
} from "@/lib/server/catalog";
import type { EditionMetaFile, EditionStatus } from "@/lib/types/magazine";

export async function updateEditionMeta(
  editionId: string,
  patch: Partial<
    Pick<EditionMetaFile, "title" | "headline" | "summary" | "publishedAt" | "status">
  >,
) {
  const meta = await readEditionMeta(editionId);
  if (!meta) throw new Error("Edition not found");

  const changes = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<EditionMetaFile>;

  const updated: EditionMetaFile = {
    ...meta,
    ...changes,
    cacheVersion: new Date().toISOString(),
  };

  await writeEditionMeta(editionId, updated);

  const catalog = await readCatalog();
  const idx = catalog.editions.findIndex((e) => e.id === editionId);
  if (idx >= 0) {
    catalog.editions[idx] = {
      ...catalog.editions[idx],
      title: updated.title,
      headline: updated.headline,
      summary: updated.summary,
      publishedAt: updated.publishedAt,
      status: updated.status,
    };
    await writeCatalog(catalog);
  }

  return updated;
}

export async function replaceEditionCover(editionId: string, imageBuffer: Buffer) {
  const meta = await readEditionMeta(editionId);
  if (!meta) throw new Error("Edition not found");

  const storageRoot = await resolveEditionStorageRoot(editionId);
  await generateCoverVariants(editionId, imageBuffer, storageRoot ?? undefined);

  const updated = { ...meta, cacheVersion: new Date().toISOString() };
  await writeEditionMeta(editionId, updated);
  return updated;
}

export async function publishEdition(editionId: string) {
  return setEditionStatus(editionId, "published");
}

export async function unpublishEdition(editionId: string) {
  return setEditionStatus(editionId, "draft");
}

export async function removeEditionFromCatalog(editionId: string) {
  const catalog = await readCatalog();
  const wasCurrent = catalog.currentEditionId === editionId;
  catalog.editions = catalog.editions.filter((e) => e.id !== editionId);
  if (wasCurrent) {
    catalog.currentEditionId =
      catalog.editions.find((e) => e.status === "published")?.id ??
      catalog.editions[0]?.id ??
      null;
  }
  await writeCatalog(catalog);
  return { wasCurrent, newCurrentId: catalog.currentEditionId };
}

export async function deleteEditionStorage(editionId: string) {
  await deleteEditionAssets(editionId);
}

export async function archiveEdition(editionId: string) {
  return removeEditionFromCatalog(editionId);
}

export async function setCurrentEdition(editionId: string) {
  const meta = await readEditionMeta(editionId);
  if (!meta) throw new Error("Edition not found");

  const catalog = await readCatalog();
  catalog.currentEditionId = editionId;
  catalog.editions = catalog.editions.map((e) => ({
    ...e,
    isCurrent: e.id === editionId,
  }));
  await writeCatalog(catalog);
  return meta;
}
