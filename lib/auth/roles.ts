import type { UserRole } from "@/lib/types/user";

/** Admin role from ADMIN_EMAIL env var (Google OAuth, Vercel-safe). */
export function resolveRoleFromEmail(email: string | null | undefined): UserRole {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || !email) return "user";
  return email.trim().toLowerCase() === adminEmail ? "admin" : "user";
}

/** Admin login at /admin via ADMIN_EMAIL and ADMIN_PASSWORD. */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) return false;

  return email.trim().toLowerCase() === adminEmail && password === adminPassword;
}
