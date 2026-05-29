import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/read",
    "/profile/:path*",
    "/api/admin/:path*",
    "/api/reader/:path*",
  ],
};
