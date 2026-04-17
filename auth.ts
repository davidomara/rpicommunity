import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { withBasePath } from "@/lib/app-path";
import { loginSchema } from "@/lib/validators/auth";
import { prisma } from "@/lib/db";
import type { MemberStatus, Role } from "@/lib/domain-types";
import { IDLE_TIMEOUT_MS } from "@/lib/settings";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: Math.floor(IDLE_TIMEOUT_MS / 1000)
  },
  jwt: {
    maxAge: Math.floor(IDLE_TIMEOUT_MS / 1000)
  },
  pages: {
    signIn: withBasePath("/login")
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const identifier = parsed.data.identifier.trim().toLowerCase();
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: identifier },
                { username: identifier }
              ]
            }
          });

          if (!user || !user.passwordHash) return null;

          const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            username: user.username
          } as any;
        } catch (error) {
          console.error("Credentials authorize failed", error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: Role }).role;
        token.status = (user as { status?: MemberStatus }).status;
        token.username = (user as { username?: string }).username;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = ((token as { role?: Role }).role ?? "MEMBER") as Role;
        session.user.status = ((token as { status?: MemberStatus }).status ?? "ACTIVE") as MemberStatus;
        session.user.username = (token as { username?: string }).username || "";
        session.user.name = token.name || "";
        session.user.email = token.email || "";
      }
      return session;
    }
  }
});
