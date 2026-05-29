import { NextResponse } from "next/server";
import { getArchiveEditions, getCurrentEdition } from "@/lib/server/catalog";

export const runtime = "nodejs";

export async function GET() {
  const [current, archive] = await Promise.all([
    getCurrentEdition(),
    getArchiveEditions(),
  ]);

  return NextResponse.json({ current, archive });
}
