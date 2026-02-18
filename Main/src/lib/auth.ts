// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" }, // GANTI: email -> username
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username; // GANTI: email -> username
        const password = credentials?.password;
        
        if (!username || !password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          // CARI DI TABLE Admin, BUKAN User
          const admin = await prisma.admin.findUnique({ 
            where: { username } 
          });
          
          if (!admin) {
            console.log(`❌ Admin with username "${username}" not found`);
            return null;
          }

          // Password di seed adalah "admin123" (plain text)
          // Jika Anda menggunakan bcrypt di seed, ganti dengan compare
          const isPasswordValid = admin.password === password; // Untuk plain text
          // Atau jika di-hash: await bcrypt.compare(password, admin.password);
          
          if (!isPasswordValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log(`✅ Admin "${username}" authenticated successfully`);
          return { 
            id: admin.id.toString(), 
            username: admin.username, 
            name: "Administrator",
            role: "admin" 
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
        token.id = (user as any).id;
        token.username = (user as any).username; // GANTI: email -> username
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: String(token.id),
        username: token.username as string, // GANTI: email -> username
        name: token.name as string,
        role: (token.role as string) ?? "admin",
      } as any;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};