import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { buildRoleLoginPath, inferRoleFromProtectedPath } from "@/lib/auth/routing";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const loginUrl = new URL(
      buildRoleLoginPath({
        role: inferRoleFromProtectedPath(request.nextUrl.pathname),
        redirect: requestedPath,
      }),
      request.url
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
