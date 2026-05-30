import { head, put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { PdfEdition, PdfMagazineCatalog, PublicPdfEdition } from "@/lib/types/pdf-magazine";

const BLOB_PREFIX = "pdf-magazines";
const LOCAL_ROOT = path.join(process.cwd(), "storage", "pdf-magazines");
const LOCAL_CATALOG = path.join(LOCAL_ROOT, "catalog.json");
const LOCAL_PDF_DIR = path.join(LOCAL_ROOT, "pdfs");

const emptyCatalog: PdfMagazineCatalog = {
  activeEditionId: null,
  editions: [],
};

function blobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return undefined;
  }
  // BLOB_STORE_ID is provisioned automatically on Vercel when Blob is linked.
  void process.env.BLOB_STORE_ID;
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export function isPdfBlobStorageEnabled() {
  return Boolean(blobToken());
}

function catalogPathname() {
  return `${BLOB_PREFIX}/catalog.json`;
}

function pdfPathname(editionId: string) {
  return `${BLOB_PREFIX}/pdfs/${editionId}.pdf`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

async function ensureLocalStore() {
  await fs.mkdir(LOCAL_PDF_DIR, { recursive: true });
  try {
    await fs.access(LOCAL_CATALOG);
  } catch {
    await fs.writeFile(LOCAL_CATALOG, JSON.stringify(emptyCatalog, null, 2), "utf-8");
  }
}

export async function readPdfCatalog(): Promise<PdfMagazineCatalog> {
  if (isPdfBlobStorageEnabled()) {
    const raw = await blobRead(catalogPathname());
    if (!raw) return { ...emptyCatalog };
    return JSON.parse(raw.toString("utf-8")) as PdfMagazineCatalog;
  }

  await ensureLocalStore();
  const raw = await fs.readFile(LOCAL_CATALOG, "utf-8");
  return JSON.parse(raw) as PdfMagazineCatalog;
}

export async function writePdfCatalog(catalog: PdfMagazineCatalog) {
  const payload = JSON.stringify(catalog, null, 2);

  if (isPdfBlobStorageEnabled()) {
    const token = blobToken();
    if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

    await put(catalogPathname(), Buffer.from(payload, "utf-8"), {
      access: "private",
      addRandomSuffix: false,
      token,
    });
    return;
  }

  await ensureLocalStore();
  await fs.writeFile(LOCAL_CATALOG, payload, "utf-8");
}

function toPublicEdition(edition: PdfEdition, catalog: PdfMagazineCatalog): PublicPdfEdition {
  return {
    ...edition,
    isActive: edition.id === catalog.activeEditionId,
  };
}

export async function getActivePdfEdition(): Promise<PublicPdfEdition | null> {
  const catalog = await readPdfCatalog();
  if (!catalog.activeEditionId) return null;

  const edition = catalog.editions.find((e) => e.id === catalog.activeEditionId);
  if (!edition) return null;

  return toPublicEdition(edition, catalog);
}

export async function getPdfArchive(): Promise<PublicPdfEdition[]> {
  const catalog = await readPdfCatalog();
  return catalog.editions
    .filter((e) => e.id !== catalog.activeEditionId)
    .map((e) => toPublicEdition(e, catalog))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getAllPdfEditions(): Promise<PublicPdfEdition[]> {
  const catalog = await readPdfCatalog();
  return catalog.editions
    .map((e) => toPublicEdition(e, catalog))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getPdfEditionById(id: string): Promise<PublicPdfEdition | null> {
  const catalog = await readPdfCatalog();
  const edition = catalog.editions.find((e) => e.id === id);
  if (!edition) return null;
  return toPublicEdition(edition, catalog);
}

export async function readLocalPdfFile(id: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path.join(LOCAL_PDF_DIR, `${id}.pdf`));
  } catch {
    return null;
  }
}

export type UploadPdfInput = {
  title: string;
  fileName: string;
  pdfBuffer: Buffer;
  setAsActive?: boolean;
};

export async function uploadPdfMagazine(input: UploadPdfInput): Promise<PdfEdition> {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");

  const id = `${slugify(title) || "edition"}-${randomUUID().slice(0, 8)}`;
  const uploadedAt = new Date().toISOString();
  const setAsActive = input.setAsActive !== false;

  let pdfUrl: string;
  let blobPathname: string;

  if (isPdfBlobStorageEnabled()) {
    const token = blobToken();
    if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

    blobPathname = pdfPathname(id);
    const result = await put(blobPathname, input.pdfBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/pdf",
      token,
    });
    pdfUrl = result.url;
  } else {
    await ensureLocalStore();
    blobPathname = `local/pdfs/${id}.pdf`;
    await fs.writeFile(path.join(LOCAL_PDF_DIR, `${id}.pdf`), input.pdfBuffer);
    pdfUrl = `/api/magazines/pdf/${id}/file`;
  }

  const edition: PdfEdition = {
    id,
    title,
    fileName: input.fileName,
    pdfUrl,
    blobPathname,
    fileSize: input.pdfBuffer.length,
    uploadedAt,
  };

  const catalog = await readPdfCatalog();
  catalog.editions.unshift(edition);
  if (setAsActive) {
    catalog.activeEditionId = id;
  }
  await writePdfCatalog(catalog);

  return edition;
}
