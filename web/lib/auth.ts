import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./db";

const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL;

export const auth = betterAuth({
  ...(secret ? { secret } : {}),
  ...(baseURL ? { baseURL } : {}),
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
});
