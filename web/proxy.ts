import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const callbackURL = encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(
      new URL(`/sign-in?callbackURL=${callbackURL}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/place-order"],
};
