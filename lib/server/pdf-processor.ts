import { promises as fs } from "fs";
import {
  archivePreviousCurrentEdition,
  clearEditionAssets,
  getDirectorySizeBytes,
} from "@/lib/server/edition-storage";
import { generateCoverVariants, generatePageVariants } from "@/lib/server/image-variants";
import { editionMetaPath, editionStorageRoot } from "@/lib/server/paths";
import { renderPdfPages } from "@/lib/server/pdf-render";
import { ProcessingLog } from "@/lib/server/processing-log";
import { readCatalog, upsertEdition } from "@/lib/server/catalog";
import { PAGE_VARIANTS, COVER_VARIANTS } from "@/lib/magazine-assets";
import type { EditionMetaFile } from "@/lib/types/magazine";

export type ProcessPdfInput = {
  id: string;
  title: string;
  headline: string;
  summary: string;
  pdfBuffer: Buffer;
  setAsCurrent: boolean;
};

export type ProcessPdfResult = {
  id: string;
  pageCount: number;
  meta: EditionMetaFile;
  storageRoot: string;
  stats: {
    processingTimeMs: number;
    storageBytes: number;
    pageVariants: string[];
    coverVariants: string[];
    coverExtracted: boolean;
    pdfDiscarded: boolean;
  };
  log: ReturnType<ProcessingLog["getEntries"]>;
};

export async function processPdfMagazine(
  input: ProcessPdfInput,
): Promise<ProcessPdfResult> {
  const started = Date.now();
  const log = new ProcessingLog();

  log.add("start", `edition=${input.id} setAsCurrent=${input.setAsCurrent}`);

  if (input.setAsCurrent) {
    const catalog = await readCatalog();
    if (
      catalog.currentEditionId &&
      catalog.currentEditionId !== input.id
    ) {
      log.add("archive-previous", catalog.currentEditionId);
      await archivePreviousCurrentEdition(catalog.currentEditionId);
    }
  }

  const storageRoot = editionStorageRoot(input.id, input.setAsCurrent);
  log.add("storage-root", storageRoot);

  await clearEditionAssets(storageRoot);
  log.add("cleared-assets");

  const { pageCount, pages } = await renderPdfPages(input.pdfBuffer, {
    scale: 2,
    onProgress: (message) => log.add("render", message),
  });

  log.add("render-complete", `${pageCount} pages`);

  let coverPng: Buffer | null = null;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const pngBuffer = pages[pageNum - 1];
    log.add("webp-page", `page ${pageNum}/${pageCount}`);
    await generatePageVariants(storageRoot, pageNum, pngBuffer);
    if (pageNum === 1) coverPng = pngBuffer;
  }

  if (coverPng) {
    log.add("webp-cover", "extracted from page 1");
    await generateCoverVariants(storageRoot, coverPng);
  }

  const processedAt = new Date().toISOString();
  const meta: EditionMetaFile = {
    id: input.id,
    title: input.title,
    headline: input.headline,
    summary: input.summary,
    pageCount,
    publishedAt: processedAt,
    processedAt,
    cacheVersion: processedAt,
    assetPipeline: 3,
    storageRoot,
  };

  await fs.writeFile(
    editionMetaPath(storageRoot),
    JSON.stringify(meta, null, 2),
    "utf-8",
  );
  await upsertEdition(meta, input.setAsCurrent);

  const storageBytes = await getDirectorySizeBytes(storageRoot);
  log.add("done", `${storageBytes} bytes stored`);

  return {
    id: input.id,
    pageCount,
    meta,
    storageRoot,
    log: log.getEntries(),
    stats: {
      processingTimeMs: Date.now() - started,
      storageBytes,
      pageVariants: Object.keys(PAGE_VARIANTS),
      coverVariants: Object.keys(COVER_VARIANTS),
      coverExtracted: Boolean(coverPng),
      pdfDiscarded: true,
    },
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
