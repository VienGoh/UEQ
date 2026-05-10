import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // ✅ WAJIB: Pakai singleton, JANGAN new PrismaClient()

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;

        if (!username || !password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          // ✅ GANTI 'admin' → 'user' SESUAI SCHEMA PRISMA
          const user = await prisma.user.findUnique({
            where: { username },
          });

          if (!user) {
            console.log(`❌ User "${username}" tidak ditemukan`);
            return null;
          }

          // Validasi password (plain-text sesuai seed.cjs)
          // Untuk produksi, ganti dengan: await bcrypt.compare(password, user.password)
          const isPasswordValid = user.password === password;

          if (!isPasswordValid) {
            console.log("❌ Password salah");
            return null;
          }

          console.log(`✅ User "${username}" berhasil login`);
          return {
            id: user.id.toString(),
            username: user.username,
            name: user.fullName || user.username,
            role: user.role, // ADMIN atau STAFF sesuai enum Prisma
          };
        } catch (error) {
          console.error("🚨 Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // ⚠️ Warning DEBUG_ENABLED akan hilang di production
};