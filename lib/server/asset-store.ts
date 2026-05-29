import { del, head, list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { CoverVariant, PageVariant } from "@/lib/magazine-assets";
import type { EditionMetaFile, MagazineCatalog } from "@/lib/types/magazine";
import {
  ARCHIVE_DIR,
  CATALOG_PATH,
  CURRENT_EDITION_DIR,
  editionCoverPath,
  editionCoverPathLegacy,
  editionMetaPath,
  editionPagePath,
  editionPagePathLegacy,
  editionStorageRoot,
  STORAGE_ROOT,
  storageRootForEdition,
} from "@/lib/server/paths";

const BLOB_PREFIX = "magazines";
const emptyCatalog: MagazineCatalog = {
  currentEditionId: null,
  editions: [],
};

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export function isBlobStorageEnabled() {
  return Boolean(blobToken());
}

function catalogBlobPath() {
  return `${BLOB_PREFIX}/catalog.json`;
}

function editionMetaBlobPath(editionId: string) {
  return `${BLOB_PREFIX}/editions/${editionId}/meta.json`;
}

function pageBlobPath(editionId: string, pageNum: number, variant: PageVariant) {
  return `${BLOB_PREFIX}/editions/${editionId}/pages/${variant}/${String(pageNum).padStart(3, "0")}.webp`;
}

function coverBlobPath(editionId: string, variant: CoverVariant) {
  return `${BLOB_PREFIX}/editions/${editionId}/covers/${variant}.webp`;
}

async function blobRead(pathname: string): Promise<Buffer | null> {
  const token = blobToken();
  if (!token) return null;

  try {
    const meta = await head(pathname, { token });
    const res = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function blobWrite(pathname: string, data: Buffer) {
  const token = blobToken();
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  await put(pathname, data, {
    access: "private",
    addRandomSuffix: false,
    token,
  });
}

async function blobDeletePrefix(prefix: string) {
  const token = blobToken();
  if (!token) return;

  let cursor: string | undefined;
  do {
    const result = await list({ prefix, token, cursor });
    if (result.blobs.length) {
      await del(
        result.blobs.map((blob) => blob.url),
        { token },
      );
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);
}

async function ensureLocalStorage() {
  await fs.mkdir(CURRENT_EDITION_DIR, { recursive: true });
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  try {
    await fs.access(CATALOG_PATH);
  } catch {
    await fs.writeFile(CATALOG_PATH, JSON.stringify(emptyCatalog, null, 2), "utf-8");
  }
}

export async function readCatalog(): Promise<MagazineCatalog> {
  if (isBlobStorageEnabled()) {
    const raw = await blobRead(catalogBlobPath());
    if (!raw) return { ...emptyCatalog };
    return JSON.parse(raw.toString("utf-8")) as MagazineCatalog;
  }

  await ensureLocalStorage();
  const raw = await fs.readFile(CATALOG_PATH, "utf-8");
  return JSON.parse(raw) as MagazineCatalog;
}

export async function writeCatalog(catalog: MagazineCatalog) {
  const payload = JSON.stringify(catalog, null, 2);

  if (isBlobStorageEnabled()) {
    await blobWrite(catalogBlobPath(), Buffer.from(payload, "utf-8"));
    return;
  }

  await ensureLocalStorage();
  await fs.writeFile(CATALOG_PATH, payload, "utf-8");
}

export async function resolveEditionStorageRoot(
  editionId: string,
  currentEditionId?: string | null,
): Promise<string | null> {
  if (isBlobStorageEnabled()) return editionId;

  const catalog = currentEditionId === undefined ? await readCatalog() : null;
  const currentId = currentEditionId ?? catalog?.currentEditionId ?? null;
  const primary = storageRootForEdition(editionId, currentId);

  try {
    await fs.access(editionMetaPath(primary));
    return primary;
  } catch {
    /* try legacy */
  }

  const legacy = path.join(STORAGE_ROOT, "magazines", editionId);
  try {
    await fs.access(editionMetaPath(legacy));
    return legacy;
  } catch {
    return null;
  }
}

export async function readEditionMeta(editionId: string): Promise<EditionMetaFile | null> {
  if (isBlobStorageEnabled()) {
    const raw = await blobRead(editionMetaBlobPath(editionId));
    if (!raw) return null;
    return JSON.parse(raw.toString("utf-8")) as EditionMetaFile;
  }

  const root = await resolveEditionStorageRoot(editionId);
  if (!root) return null;

  try {
    const raw = await fs.readFile(editionMetaPath(root), "utf-8");
    return JSON.parse(raw) as EditionMetaFile;
  } catch {
    return null;
  }
}

export async function writeEditionMeta(editionId: string, meta: EditionMetaFile) {
  const payload = JSON.stringify(meta, null, 2);

  if (isBlobStorageEnabled()) {
    await blobWrite(editionMetaBlobPath(editionId), Buffer.from(payload, "utf-8"));
    return;
  }

  const root = meta.storageRoot ?? (await resolveEditionStorageRoot(editionId));
  if (!root) throw new Error("Edition storage root not found");

  await fs.writeFile(editionMetaPath(root), payload, "utf-8");
}

export async function writePageVariant(
  editionId: string,
  pageNum: number,
  variant: PageVariant,
  buffer: Buffer,
  storageRoot?: string,
) {
  if (isBlobStorageEnabled()) {
    await blobWrite(pageBlobPath(editionId, pageNum, variant), buffer);
    return;
  }

  const root = storageRoot ?? (await resolveEditionStorageRoot(editionId));
  if (!root) throw new Error("Edition storage root not found");

  const outPath = editionPagePath(root, pageNum, variant);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buffer);
}

export async function readPageVariant(
  editionId: string,
  pageNum: number,
  variant: PageVariant,
  storageRoot?: string,
): Promise<Buffer | null> {
  if (isBlobStorageEnabled()) {
    const primary = await blobRead(pageBlobPath(editionId, pageNum, variant));
    if (primary) return primary;
    if (variant !== "desktop") {
      return blobRead(pageBlobPath(editionId, pageNum, "desktop"));
    }
    return null;
  }

  const root = storageRoot ?? (await resolveEditionStorageRoot(editionId));
  if (!root) return null;

  const candidates = [
    editionPagePath(root, pageNum, variant),
    editionPagePath(root, pageNum, "desktop"),
    editionPagePathLegacy(root, pageNum),
  ];

  for (const filePath of candidates) {
    try {
      return await fs.readFile(filePath);
    } catch {
      continue;
    }
  }
  return null;
}

export async function writeCoverVariant(
  editionId: string,
  variant: CoverVariant,
  buffer: Buffer,
  storageRoot?: string,
) {
  if (isBlobStorageEnabled()) {
    await blobWrite(coverBlobPath(editionId, variant), buffer);
    return;
  }

  const root = storageRoot ?? (await resolveEditionStorageRoot(editionId));
  if (!root) throw new Error("Edition storage root not found");

  const outPath = editionCoverPath(root, variant);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buffer);
}

export async function readCoverVariant(
  editionId: string,
  variant: CoverVariant,
  storageRoot?: string,
): Promise<Buffer | null> {
  if (isBlobStorageEnabled()) {
    const primary = await blobRead(coverBlobPath(editionId, variant));
    if (primary) return primary;
    if (variant !== "desktop") {
      return blobRead(coverBlobPath(editionId, "desktop"));
    }
    return null;
  }

  const root = storageRoot ?? (await resolveEditionStorageRoot(editionId));
  if (!root) return null;

  const candidates = [
    editionCoverPath(root, variant),
    editionCoverPath(root, "desktop"),
    editionCoverPathLegacy(root),
  ];

  for (const filePath of candidates) {
    try {
      return await fs.readFile(filePath);
    } catch {
      continue;
    }
  }
  return null;
}

export async function clearEditionAssets(editionId: string, isCurrent: boolean) {
  if (isBlobStorageEnabled()) {
    await blobDeletePrefix(`${BLOB_PREFIX}/editions/${editionId}/`);
    return;
  }

  const storageRoot = editionStorageRoot(editionId, isCurrent);
  const targets = [
    path.join(storageRoot, "pages"),
    path.join(storageRoot, "covers"),
    path.join(storageRoot, "cover.webp"),
    path.join(storageRoot, "source.pdf"),
    path.join(storageRoot, "meta.json"),
  ];

  await Promise.all(
    targets.map(async (target) => {
      try {
        await fs.rm(target, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }),
  );

  await fs.mkdir(path.join(storageRoot, "pages"), { recursive: true });
  await fs.mkdir(path.join(storageRoot, "covers"), { recursive: true });
}

export async function deleteEditionAssets(editionId: string) {
  if (isBlobStorageEnabled()) {
    await blobDeletePrefix(`${BLOB_PREFIX}/editions/${editionId}/`);
    return;
  }

  const root = await resolveEditionStorageRoot(editionId);
  if (root) {
    await fs.rm(root, { recursive: true, force: true });
  }
}

export async function getEditionStorageBytes(editionId: string): Promise<number> {
  if (isBlobStorageEnabled()) {
    const token = blobToken();
    if (!token) return 0;

    let total = 0;
    let cursor: string | undefined;
    const prefix = `${BLOB_PREFIX}/editions/${editionId}/`;

    do {
      const result = await list({ prefix, token, cursor });
      for (const blob of result.blobs) {
        total += blob.size;
      }
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    return total;
  }

  const root = await resolveEditionStorageRoot(editionId);
  if (!root) return 0;
  return getDirectorySizeBytes(root);
}

async function getDirectorySizeBytes(dirPath: string): Promise<number> {
  let total = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        total += await getDirectorySizeBytes(full);
      } else if (entry.isFile()) {
        const stat = await fs.stat(full);
        total += stat.size;
      }
    }
  } catch {
    return 0;
  }
  return total;
}

export async function archivePreviousCurrentEdition(previousEditionId: string) {
  if (isBlobStorageEnabled() || !previousEditionId) return;

  const dest = path.join(ARCHIVE_DIR, previousEditionId);
  try {
    await fs.access(CURRENT_EDITION_DIR);
  } catch {
    return;
  }

  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  try {
    await fs.rm(dest, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  await fs.rename(CURRENT_EDITION_DIR, dest);
}

export function editionStorageRootForProcessing(editionId: string, isCurrent: boolean) {
  return isBlobStorageEnabled() ? editionId : editionStorageRoot(editionId, isCurrent);
}
