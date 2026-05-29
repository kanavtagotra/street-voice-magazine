import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/guards";
import type { ReadingPreferences } from "@/lib/types/user";
import { findUserById, toPublicUser, updateUserPreferences } from "@/lib/server/users";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const user = await findUserById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ preferences: user.preferences });
}

export async function PATCH(request: NextRequest) {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as ReadingPreferences;
  const updated = await updateUserPreferences(session.user.id, body);

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}
