import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, forbiddenResponse } from "@/lib/auth/guards";
import { processPdfMagazine, slugify } from "@/lib/server/pdf-processor";

export const runtime = "nodejs";
export const maxDuration = 300;

function formatError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
  return { message: String(error) };
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminApi(request);
  if (!admin) return forbiddenResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file");

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

    const title = String(formData.get("title") ?? "").trim();
    const headline = String(formData.get("headline") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const customId = String(formData.get("id") ?? "").trim();
    const setAsCurrent = formData.get("setAsCurrent") !== "false";

    if (!title || !headline) {
      return NextResponse.json(
        { error: "Title and headline are required" },
        { status: 400 },
      );
    }

    const id = customId ? slugify(customId) : slugify(title);
    if (!id) {
      return NextResponse.json({ error: "Invalid edition id" }, { status: 400 });
    }

    console.log(`[magazine-upload] Starting: ${file.name} (${file.size} bytes) → ${id}`);

    const pdfBuffer = Buffer.from(await file.arrayBuffer());

    const result = await processPdfMagazine({
      id,
      title,
      headline,
      summary: summary || `${title} — Street Voice Magazine edition.`,
      pdfBuffer,
      setAsCurrent,
    });

    console.log(
      `[magazine-upload] Success: ${result.pageCount} pages in ${result.stats.processingTimeMs}ms`,
    );

    return NextResponse.json({
      success: true,
      edition: {
        id: result.id,
        title: result.meta.title,
        pageCount: result.pageCount,
        isCurrent: setAsCurrent,
        storageRoot: result.storageRoot,
        coverUrl: `/api/magazines/${result.id}/cover?v=mobile`,
        readUrl: "/read",
      },
      stats: result.stats,
      log: result.log,
    });
  } catch (error) {
    const formatted = formatError(error);
    console.error("[magazine-upload] FAILED:", formatted.message);
    if (formatted.stack) console.error(formatted.stack);

    return NextResponse.json(
      {
        error: formatted.message,
        details: formatted.stack,
        hint:
          "On Windows, ensure `canvas` and `pdf-to-img` are installed. Run: npm install canvas pdf-to-img sharp",
      },
      { status: 500 },
    );
  }
}
