import type { UserRole } from "@/lib/types/user";

/** Admin role from ADMIN_EMAIL env var (Vercel-safe, no filesystem). */
export function resolveRoleFromEmail(email: string | null | undefined): UserRole {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || !email) return "user";
  return email.trim().toLowerCase() === adminEmail ? "admin" : "user";
}
