import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import { authConfig } from "./auth.config";

// Full auth config with Prisma adapter (for Node.js runtime)
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db as any),
});
