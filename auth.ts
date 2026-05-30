import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import { verifyAdminCredentials } from "@/lib/auth/roles";
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
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!username || !password) return null;

        if (!verifyAdminCredentials(username, password)) return null;

        return {
          id: "admin",
          name: username,
          email: `${username}@admin.local`,
          role: "admin" as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.role = (user.role as UserRole) ?? "user";
      } else if (token.role) {
        return token;
      } else if (token.email) {
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        token.role =
          String(token.email).toLowerCase() === adminEmail ? "admin" : "user";
      }

      return token;
    },
  },
});
