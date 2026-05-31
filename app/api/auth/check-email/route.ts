import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "@/lib/auth/validation";
import { findUserByEmail } from "@/lib/server/user-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(String(searchParams.get("email") ?? ""));

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  return NextResponse.json({ exists: Boolean(user) });
}
