import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Email registration is disabled. Please sign in with Google to create an account.",
    },
    { status: 503 },
  );
}
