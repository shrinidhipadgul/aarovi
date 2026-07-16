import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname, search } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminSignIn = pathname === "/admin/sign-in";

  if (isAdminRoute && !isAdminSignIn && !sessionCookie) {
    const callbackURL = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/admin/sign-in?callbackURL=${callbackURL}`, request.url),
    );
  }

  if (!sessionCookie) {
    const callbackURL = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/sign-in?callbackURL=${callbackURL}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/place-order",
    "/status/:path*",
    "/orders",
    "/profile/:path*",
    "/admin",
    "/admin/:path*",
  ],
};