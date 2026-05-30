import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/guards";
import type { ReadingPreferences } from "@/lib/types/user";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  // Reading preferences are stored in the browser (localStorage), not on the server.
  return NextResponse.json({ preferences: {} });
}

export async function PATCH(request: NextRequest) {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as ReadingPreferences;

  // Acknowledge without filesystem persistence; client saves to localStorage.
  return NextResponse.json({ preferences: body });
}
