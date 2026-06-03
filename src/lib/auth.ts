import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { db } from "./db";
import { verifyPassword } from "./password";
import { checkLoginRateLimit } from "./rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const rl = checkLoginRateLimit(parsed.data.email);
        if (!rl.allowed) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            avatar: true,
            banned: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        if (user.banned) return null;

        const isValid = await verifyPassword(
          parsed.data.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/tr/giris",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await db.user.upsert({
          where: { email: user.email! },
          update: {},
          create: {
            email: user.email!,
            name: user.name ?? user.email!.split("@")[0],
            avatar: user.image ?? null,
            role: "USER",
          },
        });
        return true;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      } else if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (!token.id) return session;
      const dbUser = await db.user.findUnique({
        where: { id: token.id as string },
        select: { banned: true, role: true },
      });
      if (!dbUser || dbUser.banned) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { expires: session.expires } as any;
      }
      session.user.id = token.id as string;
      session.user.role = dbUser.role as "USER" | "AGENT" | "ADMIN" | "SUPER_ADMIN";
      return session;
    },
  },
});
