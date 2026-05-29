import { timingSafeEqual } from "crypto";

export function verifyAdminSecret(provided: string | null): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !provided) return false;

  try {
    const a = Buffer.from(provided, "utf-8");
    const b = Buffer.from(secret, "utf-8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
