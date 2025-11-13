import NextAuth, { type NextAuthOptions } from "next-auth";
import type { User as AuthUser } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

// Define JWT token structure
interface JWT {
  role?: string;
  id?: string;
  iat?: number;
  [key: string]: any;
}

// Define session structure
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
    // ✅ Credentials (email-password)
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          const user = await prisma.user.findFirst({
            where: { email: credentials.email },
          });
          if (user) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password!
            );
            if (isPasswordCorrect) {
              return {
                id: user.id,
                email: user.email,
                role: user.role,
              };
            }
          }
        } catch (err: any) {
          throw new Error(err);
        }
        return null;
      },
    }),

    // ✅ Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Facebook Login
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  // ✅ Callbacks
  callbacks: {
    async signIn({ user, account }: { user: AuthUser; account: any }): Promise<boolean> {
      try {
        if (account?.provider === "credentials") return true;

        if (account?.provider === "google" || account?.provider === "facebook") {
          const existingUser = await prisma.user.findFirst({
            where: { email: user.email! },
          });

          // If user does not exist → create new
          if (!existingUser) {
            await prisma.user.create({
              data: {
                id: nanoid(),
                email: user.email!,
                role: "user",
                password: null, // since it's social login
              },
            });
          }
          return true;
        }

        return true;
      } catch (error) {
        console.error("❌ Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }: { token: JWT; user?: AuthUser }): Promise<JWT> {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.iat = Math.floor(Date.now() / 1000);
      }

      if ((!token.role || !token.id) && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true },
          });
          if (dbUser?.role) token.role = dbUser.role;
        } catch {}
      }

      const now = Math.floor(Date.now() / 1000);
      const tokenAge = token.iat ? now - token.iat : 0;
      const maxAge = 15 * 60;
      if (token.iat && tokenAge > maxAge) return {};
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      if (!session.user.role) session.user.role = "user";
      return session;
    },
  },

  // ✅ Pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ✅ Session config
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },
  jwt: {
    maxAge: 15 * 60,
  },

  // ✅ Secret
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
