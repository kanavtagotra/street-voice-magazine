import type { UserRole } from "@/lib/types/user";

/** Admin role from ADMIN_EMAIL env var (Google OAuth, Vercel-safe). */
export function resolveRoleFromEmail(email: string | null | undefined): UserRole {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || !email) return "user";
  return email.trim().toLowerCase() === adminEmail ? "admin" : "user";
}

/** Admin login at /admin via ADMIN_USERNAME and ADMIN_PASSWORD. */
export function verifyAdminCredentials(
  username: string,
  password: string,
): boolean {
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminUsername || !adminPassword) return false;

  return username === adminUsername && password === adminPassword;
}
