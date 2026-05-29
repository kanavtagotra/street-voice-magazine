import path from "path";
import type { CoverVariant, PageVariant } from "@/lib/magazine-assets";

export const STORAGE_ROOT = path.join(process.cwd(), "storage");
export const CURRENT_EDITION_DIR = path.join(STORAGE_ROOT, "current-edition");
export const ARCHIVE_DIR = path.join(STORAGE_ROOT, "archive");
export const CATALOG_PATH = path.join(STORAGE_ROOT, "catalog.json");

/** Root folder for an edition's processed assets */
export function editionStorageRoot(editionId: string, isCurrent: boolean) {
  return isCurrent ? CURRENT_EDITION_DIR : path.join(ARCHIVE_DIR, editionId);
}

export function editionMetaPath(storageRoot: string) {
  return path.join(storageRoot, "meta.json");
}

function pageFileName(pageNum: number) {
  return `${String(pageNum).padStart(3, "0")}.webp`;
}

export function editionPagePath(
  storageRoot: string,
  pageNum: number,
  variant: PageVariant = "desktop",
) {
  return path.join(storageRoot, "pages", variant, pageFileName(pageNum));
}

export function editionPagePathLegacy(storageRoot: string, pageNum: number) {
  return path.join(storageRoot, "pages", pageFileName(pageNum));
}

export function editionCoverPath(storageRoot: string, variant: CoverVariant = "desktop") {
  return path.join(storageRoot, "covers", `${variant}.webp`);
}

export function editionCoverPathLegacy(storageRoot: string) {
  return path.join(storageRoot, "cover.webp");
}

/** Resolve storage root for API handlers from catalog */
export function storageRootForEdition(
  editionId: string,
  currentEditionId: string | null,
) {
  return editionId === currentEditionId
    ? CURRENT_EDITION_DIR
    : path.join(ARCHIVE_DIR, editionId);
}
