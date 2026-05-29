import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const READER_COOKIE = "sv_reader";

function getSecret() {
  return process.env.READER_SECRET ?? process.env.ADMIN_SECRET ?? "dev-reader-secret-change-me";
}

export function createReaderToken(editionId: string): string {
  const expires = Date.now() + 4 * 60 * 60 * 1000;
  const payload = `${editionId}:${expires}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${editionId}.${expires}.${sig}`;
}

export function verifyReaderToken(token: string | undefined): string | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [editionId, expiresStr, sig] = parts;
  const expires = Number(expiresStr);
  if (!editionId || !Number.isFinite(expires) || expires < Date.now()) return null;

  const expected = createHmac("sha256", getSecret())
    .update(`${editionId}:${expires}`)
    .digest("hex");

  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return editionId;
}

export async function getEditionIdFromReaderCookie(): Promise<string | null> {
  const jar = await cookies();
  return verifyReaderToken(jar.get(READER_COOKIE)?.value);
}

export function readerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 4 * 60 * 60,
    path: "/",
  };
}
