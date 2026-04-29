import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = Boolean(req.auth?.user);
  const isSignInPage = nextUrl.pathname === "/signin";

  if (isAuthenticated && isSignInPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isAuthenticated || isSignInPage) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/signin", nextUrl);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${nextUrl.pathname}${nextUrl.search}`
  );

  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[^/]+$).*)",
  ],
};