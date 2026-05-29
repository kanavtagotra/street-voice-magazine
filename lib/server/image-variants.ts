import sharp from "sharp";
import {
  COVER_VARIANTS,
  PAGE_VARIANTS,
  type CoverVariant,
  type PageVariant,
} from "@/lib/magazine-assets";
import {
  readCoverVariant,
  readPageVariant,
  writeCoverVariant,
  writePageVariant,
} from "@/lib/server/asset-store";

type VariantConfig = { width: number; quality: number; effort: number };

async function renderWebpVariant(input: Buffer, config: VariantConfig): Promise<Buffer> {
  return sharp(input)
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
    .toBuffer();
}

export async function generatePageVariants(
  editionId: string,
  pageNum: number,
  pngBuffer: Buffer,
  storageRoot?: string,
) {
  for (const [variant, config] of Object.entries(PAGE_VARIANTS) as [
    PageVariant,
    VariantConfig,
  ][]) {
    const webp = await renderWebpVariant(pngBuffer, config);
    await writePageVariant(editionId, pageNum, variant, webp, storageRoot);
  }
}

export async function generateCoverVariants(
  editionId: string,
  pngBuffer: Buffer,
  storageRoot?: string,
) {
  for (const [variant, config] of Object.entries(COVER_VARIANTS) as [
    CoverVariant,
    VariantConfig,
  ][]) {
    const webp = await renderWebpVariant(pngBuffer, config);
    await writeCoverVariant(editionId, variant, webp, storageRoot);
  }
}

export async function resolvePageFile(
  editionId: string,
  pageNum: number,
  variant: PageVariant,
  storageRoot?: string,
): Promise<Buffer | null> {
  return readPageVariant(editionId, pageNum, variant, storageRoot);
}

export async function resolveCoverFile(
  editionId: string,
  variant: CoverVariant,
  storageRoot?: string,
): Promise<Buffer | null> {
  return readCoverVariant(editionId, variant, storageRoot);
}
