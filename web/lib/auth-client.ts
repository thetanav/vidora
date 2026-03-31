import { createAuthClient } from "better-auth/react";

export const { getSession, signIn, signOut, useSession } = createAuthClient();
