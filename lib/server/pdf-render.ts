import { createRequire } from "node:module";
import path from "node:path";
import { pdf } from "pdf-to-img";

const nodeRequire = createRequire(path.join(process.cwd(), "package.json"));

export type RenderProgressCallback = (message: string) => void;

function getPdfJsInitParams() {
  const pdfjsRoot = path.dirname(nodeRequire.resolve("pdfjs-dist/package.json"));
  return {
    standardFontDataUrl: path.join(pdfjsRoot, "standard_fonts") + path.sep,
    cMapUrl: path.join(pdfjsRoot, "cmaps") + path.sep,
    cMapPacked: true,
    isEvalSupported: false,
  };
}

/**
 * Renders every PDF page to PNG buffers using pdfjs-dist (via pdf-to-img).
 * Configures font/cmap paths required on Windows and serverless Node.
 */
export async function renderPdfPages(
  pdfBuffer: Buffer,
  options: {
    scale?: number;
    onProgress?: RenderProgressCallback;
  } = {},
): Promise<{ pageCount: number; pages: Buffer[] }> {
  const scale = options.scale ?? 2;
  const onProgress = options.onProgress;

  onProgress?.("Initializing PDF engine…");

  let doc: Awaited<ReturnType<typeof pdf>>;
  try {
    doc = await pdf(pdfBuffer, {
      scale,
      docInitParams: getPdfJsInitParams(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to open PDF: ${msg}`);
  }

  const pages: Buffer[] = [];
  let index = 0;

  try {
    for await (const pagePng of doc) {
      index += 1;
      onProgress?.(`Rendered page ${index} of ${doc.length}`);
      pages.push(Buffer.from(pagePng));
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed rendering page ${index + 1}: ${msg}`);
  } finally {
    await doc.destroy();
  }

  if (pages.length === 0) {
    throw new Error("PDF contains no pages");
  }

  return { pageCount: pages.length, pages };
}
