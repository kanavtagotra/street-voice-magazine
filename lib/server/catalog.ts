import { promises as fs } from "fs";
import path from "path";
import type { EditionMetaFile, MagazineCatalog } from "@/lib/types/magazine";
import {
  ARCHIVE_DIR,
  CATALOG_PATH,
  CURRENT_EDITION_DIR,
  STORAGE_ROOT,
  editionMetaPath,
  storageRootForEdition,
} from "@/lib/server/paths";
import { buildCoverSrcSet, coverImageUrl } from "@/lib/server/magazine-access";

const emptyCatalog: MagazineCatalog = {
  currentEditionId: null,
  editions: [],
};

const LEGACY_MAGAZINES_DIR = path.join(STORAGE_ROOT, "magazines");

export async function ensureStorage() {
  await fs.mkdir(CURRENT_EDITION_DIR, { recursive: true });
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  try {
    await fs.access(CATALOG_PATH);
  } catch {
    await fs.writeFile(CATALOG_PATH, JSON.stringify(emptyCatalog, null, 2), "utf-8");
  }
}

export async function readCatalog(): Promise<MagazineCatalog> {
  await ensureStorage();
  const raw = await fs.readFile(CATALOG_PATH, "utf-8");
  return JSON.parse(raw) as MagazineCatalog;
}

export async function writeCatalog(catalog: MagazineCatalog) {
  await ensureStorage();
  await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2), "utf-8");
}

async function tryReadMetaAt(storageRoot: string): Promise<EditionMetaFile | null> {
  try {
    const raw = await fs.readFile(editionMetaPath(storageRoot), "utf-8");
    return JSON.parse(raw) as EditionMetaFile;
  } catch {
    return null;
  }
}

export async function resolveEditionStorageRoot(editionId: string): Promise<string | null> {
  const catalog = await readCatalog();
  const primary = storageRootForEdition(editionId, catalog.currentEditionId);
  if (await tryReadMetaAt(primary)) return primary;

  const legacy = path.join(LEGACY_MAGAZINES_DIR, editionId);
  if (await tryReadMetaAt(legacy)) return legacy;

  return null;
}

export async function readEditionMeta(id: string): Promise<EditionMetaFile | null> {
  const root = await resolveEditionStorageRoot(id);
  if (!root) return null;
  return tryReadMetaAt(root);
}

export function toPublicEdition(meta: EditionMetaFile, isCurrent: boolean) {
  return {
    id: meta.id,
    title: meta.title,
    headline: meta.headline,
    summary: meta.summary,
    pageCount: meta.pageCount,
    publishedAt: meta.publishedAt,
    isCurrent,
    coverUrl: coverImageUrl(meta.id, "mobile", meta.cacheVersion),
    coverSrcSet: buildCoverSrcSet(meta.id, meta.cacheVersion),
  };
}

export async function getCurrentEdition() {
  const catalog = await readCatalog();
  if (!catalog.currentEditionId) return null;
  const meta = await readEditionMeta(catalog.currentEditionId);
  if (!meta) return null;
  return toPublicEdition(meta, true);
}

export async function getArchiveEditions() {
  const catalog = await readCatalog();
  const archive: ReturnType<typeof toPublicEdition>[] = [];

  for (const edition of catalog.editions) {
    if (edition.id === catalog.currentEditionId) continue;
    const meta = await readEditionMeta(edition.id);
    if (meta) archive.push(toPublicEdition(meta, false));
  }

  return archive.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function upsertEdition(meta: EditionMetaFile, setAsCurrent: boolean) {
  const catalog = await readCatalog();

  const record = {
    id: meta.id,
    title: meta.title,
    headline: meta.headline,
    summary: meta.summary,
    pageCount: meta.pageCount,
    publishedAt: meta.publishedAt,
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
