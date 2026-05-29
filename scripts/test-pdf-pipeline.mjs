/**
 * Test PDF pipeline locally (Windows-friendly).
 * Usage: node scripts/test-pdf-pipeline.mjs path/to/file.pdf
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pdf } from "pdf-to-img";
import sharp from "sharp";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pdfPath = process.argv[2];

if (!pdfPath) {
  console.error("Usage: node scripts/test-pdf-pipeline.mjs <file.pdf>");
  process.exit(1);
}

const pdfjsRoot = path.dirname(require.resolve("pdfjs-dist/package.json"));
const buf = await fs.readFile(pdfPath);

console.log("Testing pdf-to-img with", buf.length, "bytes");

const doc = await pdf(buf, {
  scale: 2,
  docInitParams: {
    standardFontDataUrl: path.join(pdfjsRoot, "standard_fonts") + path.sep,
    cMapUrl: path.join(pdfjsRoot, "cmaps") + path.sep,
    cMapPacked: true,
    isEvalSupported: false,
  },
});

console.log("Pages:", doc.length);

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "storage", "test-out");
await fs.mkdir(outDir, { recursive: true });

let n = 0;
for await (const png of doc) {
  n++;
  const webp = path.join(outDir, `page-${String(n).padStart(3, "0")}.webp`);
  await sharp(png).webp({ quality: 80 }).toFile(webp);
  console.log("Wrote", webp);
}

await doc.destroy();
console.log("Pipeline test OK");
