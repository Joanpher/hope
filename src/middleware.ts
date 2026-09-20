import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const ADMIN_ROUTES = ["/admin"];
const DASHBOARD_ROUTES = ["/dashboard", "/solicitudes", "/perfil", "/notificaciones"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as { role?: string } | undefined)?.role;

  // Auth routes: redirect to dashboard if already logged in
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (isLoggedIn) {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Admin routes: only allow admins
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/admin", req.url));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/acceso-denegado", req.url));
    }
    return NextResponse.next();
  }

  // Dashboard routes: require login
  if (DASHBOARD_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
