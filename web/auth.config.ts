import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// Base auth config without adapter (for Edge Runtime / middleware)
export const authConfig: NextAuthConfig = {
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedRoutes = ["/home", "/upload", "/tasks", "/feedback"];
      const authRoutes = ["/", "/login"];

      const isProtectedRoute = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );
      const isAuthRoute = authRoutes.includes(nextUrl.pathname);

      if (isProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/home", nextUrl));
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
};
