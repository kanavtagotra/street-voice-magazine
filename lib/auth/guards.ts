import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { verifyAdminSecret } from "@/lib/server/auth";

export async function getSession() {
  return auth();
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

/** Admin API: session role admin, or legacy x-admin-secret header */
export async function requireAdminApi(request: Request) {
  const session = await auth();
  if (session?.user?.role === "admin") {
    return { type: "session" as const, session };
  }

  const secret = request.headers.get("x-admin-secret");
  if (verifyAdminSecret(secret)) {
    return { type: "secret" as const, session: null };
  }

  return null;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
