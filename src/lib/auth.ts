import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      // Callback fixo em /api/auth/callback/microsoft-entra-id — é a redirect
      // URI já cadastrada no app registration do Azure (nome do provider no
      // Auth.js v5); o default do NextAuth v4 seria "azure-ad", por isso o
      // override explícito aqui em vez de recadastrar a URI no Azure.
      id: "microsoft-entra-id",
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      // "common" accepts both personal Microsoft accounts (outlook.com,
      // hotmail.com) and work/school (Entra ID) accounts.
      tenantId: "common",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
