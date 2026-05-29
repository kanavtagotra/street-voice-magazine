/**
 * Optional: process a local PDF into storage for development.
 * Usage: node scripts/seed-demo-edition.mjs path/to/magazine.pdf
 */
import { readFile } from "fs/promises";

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("Usage: node scripts/seed-demo-edition.mjs <file.pdf>");
  process.exit(1);
}

const secret = process.env.ADMIN_SECRET;
if (!secret) {
  console.error("Set ADMIN_SECRET in environment");
  process.exit(1);
}

const buffer = await readFile(pdfPath);
const form = new FormData();
form.append("file", new Blob([buffer], { type: "application/pdf" }), "magazine.pdf");
form.append("title", "April 2026");
form.append("headline", "April Cover Story");
form.append("summary", "Demo seeded edition for Street Voice Magazine.");
form.append("id", "april-2026");
form.append("setAsCurrent", "true");

const base = process.env.BASE_URL ?? "http://localhost:3000";
const res = await fetch(`${base}/api/admin/upload`, {
  method: "POST",
  headers: { "x-admin-secret": secret },
  body: form,
});

const json = await res.json();
console.log(res.status, json);
