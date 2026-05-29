import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth/guards";
import { findUserById, toPublicUser, updateUserProfile } from "@/lib/server/users";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const user = await findUserById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user: toPublicUser(user) });
}

export async function PATCH(request: NextRequest) {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as { name?: string; image?: string };
  const updated = await updateUserProfile(session.user.id, {
    name: body.name,
    image: body.image,
  });

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}
