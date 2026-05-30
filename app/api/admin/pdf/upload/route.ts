import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import { uploadPdfMagazine } from "@/lib/server/pdf-magazine-store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") ?? "").trim();
    const replace = formData.get("replace") === "true";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const maxBytes = 80 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: "File exceeds 80MB limit" }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(await file.arrayBuffer());
    const edition = await uploadPdfMagazine({
      title: title || file.name.replace(/\.pdf$/i, ""),
      fileName: file.name,
      pdfBuffer,
      setAsActive: true,
    });

    return NextResponse.json({
      success: true,
      replaced: replace,
      edition,
      message: replace
        ? "Current magazine replaced successfully."
        : "Magazine uploaded and set as active.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
