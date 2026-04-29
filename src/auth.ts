import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;
const hasExplicitAuthSecret = Boolean(process.env.AUTH_SECRET);
const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV !== "production"
    ? "meal-ai-app-dev-only-secret"
    : undefined);

export const isGoogleAuthConfigured = Boolean(
  googleClientId && googleClientSecret && hasExplicitAuthSecret
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  providers: isGoogleAuthConfigured
    ? [
        Google({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        }),
      ]
    : [],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
});