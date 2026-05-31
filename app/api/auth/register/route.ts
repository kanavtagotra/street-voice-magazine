import { NextResponse } from "next/server";
import {
  isValidEmail,
  normalizeEmail,
  validateName,
  validatePassword,
} from "@/lib/auth/validation";
import { createUserWithPassword, findUserByEmail } from "@/lib/server/user-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const nameError = validateName(name || email.split("@")[0]);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 },
      );
    }

    await createUserWithPassword({
      email,
      password,
      name: name || email.split("@")[0],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 },
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Network error. Please try again in a moment." },
      { status: 500 },
    );
  }
}
