import NextAuth from "next-auth";
import { customFetch } from "@auth/core";
import Google from "next-auth/providers/google";

const googleFetch: typeof fetch = async (...args) => {
  try {
    return await fetch(...args);
  } catch (error) {
    const code = error instanceof TypeError
      ? (error.cause as { code?: string } | undefined)?.code
      : undefined;

    if (code === "UND_ERR_CONNECT_TIMEOUT") {
      return fetch(...args);
    }

    throw error;
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET?.trim(),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID?.trim(),
      clientSecret: process.env.AUTH_GOOGLE_SECRET?.trim(),
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
      [customFetch]: googleFetch,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
