import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { authConfig } from "@/auth.config";
import { AUTH_INTENT_COOKIE, type AuthIntent } from "@/lib/auth/intent";
import { resolveRoleFromEmail, verifyAdminCredentials } from "@/lib/auth/roles";
import { normalizeEmail } from "@/lib/auth/validation";
import {
  findUserByEmail,
  upsertGoogleUser,
  verifyUserPassword,
} from "@/lib/server/user-store";
import type { UserRole } from "@/lib/types/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await verifyUserPassword(email, password);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        if (!verifyAdminCredentials(email, password)) return null;

        return {
          id: "admin",
          name: "Admin",
          email,
          role: "admin" as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        const cookieStore = await cookies();
        const intent = cookieStore.get(AUTH_INTENT_COOKIE)?.value as AuthIntent | undefined;
        const existing = await findUserByEmail(email);

        if (intent === "signin" && !existing) {
          return "/sign-up?error=no_account";
        }

        if (intent === "signup" && existing) {
          return "/sign-in?error=exists";
        }

        await upsertGoogleUser({
          email,
          name: user.name,
          image: user.image,
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.picture = user.image ?? token.picture;
        token.role =
          (user.role as UserRole) ?? resolveRoleFromEmail(user.email ?? token.email);
      } else if (!token.role && token.email) {
        token.role = resolveRoleFromEmail(String(token.email));
      }

      return token;
    },
  },
});
