import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/bookings", "/barber", "/admin"];
const barberRoutes = ["/barber"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/booking/")) {
    return NextResponse.next();
  }

  // Protect routes - redirect to login if not authenticated
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (barberRoutes.some((route) => pathname.startsWith(route))) {
      if (token.role !== "BARBER" && token.role !== "ADMIN") {
        // Customer or other roles trying to access barber routes - redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Redirect logged-in users from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (token.role === "BARBER") {
        return NextResponse.redirect(new URL("/barber/profile", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/barber/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/booking/:path*",
  ],
};
