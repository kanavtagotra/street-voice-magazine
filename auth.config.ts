import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/lib/types/user";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "admin";

      if (pathname.startsWith("/admin/dashboard")) {
        return isAdmin;
      }
      if (pathname === "/read" || pathname.startsWith("/profile")) {
        return isLoggedIn;
      }
      if (pathname.startsWith("/api/reader")) {
        return isLoggedIn;
      }
      if (pathname.startsWith("/api/admin")) {
        if (isAdmin) return true;
        return !!request.headers.get("x-admin-secret");
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as UserRole) ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub);
        session.user.role = (token.role as UserRole) ?? "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
