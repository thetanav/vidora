import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth user id into the token right after signin.
      if (account && profile && typeof profile.sub === "string") {
        token.sub = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure `session.user.id` is available for API auth checks.
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
})