import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import {
  findUserByEmail,
  findUserById,
  toPublicUser,
  upsertOAuthUser,
  verifyUserCredentials,
} from "@/lib/server/users";
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
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await verifyUserCredentials(email, password);
        if (!user) return null;

        const pub = toPublicUser(user);
        return {
          id: pub.id,
          email: pub.email,
          name: pub.name,
          image: pub.image,
          role: pub.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await upsertOAuthUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await findUserByEmail(user.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
        } else if (user.id) {
          token.id = user.id;
          token.role = (user.role as UserRole) ?? "user";
        }
      } else if (token.id) {
        const dbUser = await findUserById(String(token.id));
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
  },
});
