import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.next();
  }

  const role = request.cookies.get("alpha-role")?.value ?? "user";
  const adminOnlyRoutes = ["/overview", "/analytics", "/reports"];
  const isAdminOnlyRoute = adminOnlyRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (role !== "admin" && isAdminOnlyRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/products";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/overview", "/products/:path*", "/analytics", "/reports", "/settings"],
};
