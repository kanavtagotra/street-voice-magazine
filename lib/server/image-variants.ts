import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import {
  COVER_VARIANTS,
  PAGE_VARIANTS,
  type CoverVariant,
  type PageVariant,
} from "@/lib/magazine-assets";
import {
  editionCoverPath,
  editionCoverPathLegacy,
  editionPagePath,
  editionPagePathLegacy,
} from "@/lib/server/paths";

type VariantConfig = { width: number; quality: number; effort: number };

async function writeWebpVariant(
  input: Buffer,
  outPath: string,
  config: VariantConfig,
) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await sharp(input)
    .rotate()
    .resize({
      width: config.width,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: config.quality,
      effort: config.effort,
      smartSubsample: true,
    })
    .toFile(outPath);
}

export async function generatePageVariants(
  storageRoot: string,
  pageNum: number,
  pngBuffer: Buffer,
) {
  for (const [variant, config] of Object.entries(PAGE_VARIANTS) as [
    PageVariant,
    VariantConfig,
  ][]) {
    await writeWebpVariant(
      pngBuffer,
      editionPagePath(storageRoot, pageNum, variant),
      config,
    );
  }
}

export async function generateCoverVariants(storageRoot: string, pngBuffer: Buffer) {
  for (const [variant, config] of Object.entries(COVER_VARIANTS) as [
    CoverVariant,
    VariantConfig,
  ][]) {
    await writeWebpVariant(
      pngBuffer,
      editionCoverPath(storageRoot, variant),
      config,
    );
  }
}

export async function resolvePageFile(
  storageRoot: string,
  pageNum: number,
  variant: PageVariant,
): Promise<Buffer | null> {
  const candidates = [
    editionPagePath(storageRoot, pageNum, variant),
    editionPagePath(storageRoot, pageNum, "desktop"),
    editionPagePathLegacy(storageRoot, pageNum),
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

export async function resolveCoverFile(
  storageRoot: string,
  variant: CoverVariant,
): Promise<Buffer | null> {
  const candidates = [
    editionCoverPath(storageRoot, variant),
    editionCoverPath(storageRoot, "desktop"),
    editionCoverPathLegacy(storageRoot),
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
