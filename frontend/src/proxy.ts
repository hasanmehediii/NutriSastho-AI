import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "nutrishastho_user";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/health-input",
  "/budget",
  "/diet-plan",
  "/risk-analysis",
  "/nearby-care",
  "/reports",
  "/family",
  "/settings",
];

const AUTH_PAGES = new Set(["/login", "/register"]);

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PAGES.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
