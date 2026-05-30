import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/read",
    "/profile/:path*",
    "/api/admin/:path*",
    "/api/reader/:path*",
  ],
};
