import type { EditionMetaFile, EditionRecord, EditionStatus, MagazineCatalog } from "@/lib/types/magazine";
import {
  readCatalog as readCatalogStore,
  readEditionMeta as readEditionMetaStore,
  resolveEditionStorageRoot,
  writeCatalog as writeCatalogStore,
} from "@/lib/server/asset-store";
import { buildCoverSrcSet, coverImageUrl } from "@/lib/server/magazine-access";

export function normalizeEditionStatus(status?: EditionStatus): EditionStatus {
  return status === "draft" ? "draft" : "published";
}

export function isEditionPublished(record: Pick<EditionRecord, "status">) {
  return normalizeEditionStatus(record.status) === "published";
}

export async function readCatalog(): Promise<MagazineCatalog> {
  const catalog = await readCatalogStore();
  return {
    ...catalog,
    editions: catalog.editions.map((edition) => ({
      ...edition,
      status: normalizeEditionStatus(edition.status),
    })),
  };
}

export async function writeCatalog(catalog: MagazineCatalog) {
  await writeCatalogStore(catalog);
}

export { resolveEditionStorageRoot };

export async function readEditionMeta(id: string): Promise<EditionMetaFile | null> {
  const meta = await readEditionMetaStore(id);
  if (!meta) return null;
  return {
    ...meta,
    status: normalizeEditionStatus(meta.status),
  };
}

export function toPublicEdition(meta: EditionMetaFile, isCurrent: boolean) {
  return {
    id: meta.id,
    title: meta.title,
    headline: meta.headline,
    summary: meta.summary,
    pageCount: meta.pageCount,
    publishedAt: meta.publishedAt,
    status: normalizeEditionStatus(meta.status),
    isCurrent,
    coverUrl: coverImageUrl(meta.id, "mobile", meta.cacheVersion),
    coverSrcSet: buildCoverSrcSet(meta.id, meta.cacheVersion),
  };
}

export async function getCurrentEdition() {
  const catalog = await readCatalog();
  if (!catalog.currentEditionId) return null;

  const record = catalog.editions.find((e) => e.id === catalog.currentEditionId);
  if (!record || !isEditionPublished(record)) return null;

  const meta = await readEditionMeta(catalog.currentEditionId);
  if (!meta || !isEditionPublished(meta)) return null;

  return toPublicEdition(meta, true);
}

export async function getArchiveEditions() {
  const catalog = await readCatalog();
  const archive: ReturnType<typeof toPublicEdition>[] = [];

  for (const edition of catalog.editions) {
    if (edition.id === catalog.currentEditionId) continue;
    if (!isEditionPublished(edition)) continue;

    const meta = await readEditionMeta(edition.id);
    if (meta && isEditionPublished(meta)) {
      archive.push(toPublicEdition(meta, false));
    }
  }

  return archive.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/** All editions for admin views (includes drafts) */
export async function getAllEditionsAdmin() {
  const catalog = await readCatalog();
  const editions: ReturnType<typeof toPublicEdition>[] = [];

  for (const edition of catalog.editions) {
    const meta = await readEditionMeta(edition.id);
    if (meta) {
      editions.push(toPublicEdition(meta, edition.id === catalog.currentEditionId));
    }
  }

  return editions.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function upsertEdition(
  meta: EditionMetaFile,
  setAsCurrent: boolean,
  options?: { preservePublishedAt?: boolean },
) {
  const catalog = await readCatalog();
  const existing = catalog.editions.find((e) => e.id === meta.id);
  const status = normalizeEditionStatus(meta.status);

  const record: EditionRecord = {
    id: meta.id,
    title: meta.title,
    headline: meta.headline,
    summary: meta.summary,
    pageCount: meta.pageCount,
    publishedAt:
      options?.preservePublishedAt && existing?.publishedAt
        ? existing.publishedAt
        : meta.publishedAt,
    status,
    isCurrent: setAsCurrent,
  };

  const existingIndex = catalog.editions.findIndex((e) => e.id === meta.id);
  if (existingIndex >= 0) {
    catalog.editions[existingIndex] = record;
  } else {
    catalog.editions.unshift(record);
  }

  if (setAsCurrent) {
    catalog.currentEditionId = meta.id;
    catalog.editions = catalog.editions.map((e) => ({
      ...e,
      isCurrent: e.id === meta.id,
    }));
  }

  await writeCatalog(catalog);
  return record;
}

export async function setEditionStatus(editionId: string, status: EditionStatus) {
  const meta = await readEditionMeta(editionId);
  if (!meta) throw new Error("Edition not found");

  const updated: EditionMetaFile = {
    ...meta,
    status,
    cacheVersion: new Date().toISOString(),
  };

  const { writeEditionMeta } = await import("@/lib/server/asset-store");
  await writeEditionMeta(editionId, updated);

  const catalog = await readCatalog();
  const idx = catalog.editions.findIndex((e) => e.id === editionId);
  if (idx >= 0) {
    catalog.editions[idx] = { ...catalog.editions[idx], status };
    await writeCatalog(catalog);
  }

  return updated;
}
