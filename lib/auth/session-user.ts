import type { Session } from "next-auth";
import type { PublicUser } from "@/lib/types/user";
import { resolveRoleFromEmail } from "@/lib/auth/roles";

export function sessionToPublicUser(session: Session): PublicUser {
  const email = session.user.email ?? "";
  return {
    id: session.user.id,
    email,
    name: session.user.name ?? email.split("@")[0] ?? "Reader",
    image: session.user.image ?? undefined,
    role: session.user.role ?? resolveRoleFromEmail(email),
    preferences: {},
  };
}
