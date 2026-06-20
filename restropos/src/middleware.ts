import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionToken = 
    request.cookies.get("__Secure-neonauth.session_token") || 
    request.cookies.get("neonauth.session_token");

  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";
  const isPublic =
    pathname.startsWith("/marketing_deck.html") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/order/session/") ||
    pathname.startsWith("/api/order/session/") ||
    pathname.startsWith("/order/") ||
    pathname.startsWith("/api/order/") ||
    pathname.startsWith("/ops") ||
    pathname.startsWith("/api/ops");

  if (isPublic) return NextResponse.next();

  if (!sessionToken && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
