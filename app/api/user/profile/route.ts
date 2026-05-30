import { NextRequest, NextResponse } from "next/server";
import { sessionToPublicUser } from "@/lib/auth/session-user";
import { requireUser, unauthorizedResponse } from "@/lib/auth/guards";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  return NextResponse.json({ user: sessionToPublicUser(session) });
}

export async function PATCH(request: NextRequest) {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as { name?: string; image?: string };
  const user = sessionToPublicUser(session);

  if (body.name?.trim()) {
    user.name = body.name.trim();
  }
  if (body.image) {
    user.image = body.image;
  }

  // Profile fields come from the OAuth session; updates are not persisted server-side.
  return NextResponse.json({ user });
}
