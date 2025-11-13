import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

import type { NextAuthOptions } from "next-auth"; // ✅ Correct import for v4+
import type { User as AuthUser } from "next-auth";

interface JWT {
  role?: string;
  id?: string;
  iat?: number;
  [key: string]: any;

}

interface Session {
  user: {
    id?: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Email-password login
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        if (user && (await bcrypt.compare(credentials.password, user.password!))) {
          return { id: user.id, email: user.email, role: user.role };
        }

        return null;
      },
    }),

    // ✅ Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Facebook login
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  // ✅ Custom callbacks
  callbacks: {
    async signIn({ user, account }: { user: AuthUser; account: any }) {
      if (account?.provider === "credentials") return true;

      if (account?.provider === "google" || account?.provider === "facebook") {
        const existingUser = await prisma.user.findFirst({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: nanoid(),
              email: user.email!,
              role: "user",
              password: null, // social login
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user }: { token: JWT; user?: AuthUser }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.iat = Math.floor(Date.now() / 1000);
      }

      const now = Math.floor(Date.now() / 1000);
      const tokenAge = token.iat ? now - token.iat : 0;
      if (token.iat && tokenAge > 15 * 60) return {};

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      if (!session.user.role) session.user.role = "user";
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },

  jwt: { maxAge: 15 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
