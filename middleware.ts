import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("agendamoz_session");
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isVerifyPage = request.nextUrl.pathname.startsWith("/verify");
  const isApi = request.nextUrl.pathname.startsWith("/api");

  if (!session && !isLoginPage && !isVerifyPage && !isApi) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
