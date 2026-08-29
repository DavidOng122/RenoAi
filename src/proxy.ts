import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  if (request.auth) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/home/:path*",
    "/onboarding/:path*",
    "/requests/:path*",
    "/settings/:path*",
    "/repair/:path*",
    "/api/analyse",
    "/api/clarify",
    "/api/problem-brief",
    "/api/price",
  ],
};
