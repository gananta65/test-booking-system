import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/bookings", "/barber"]

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Protect routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect logged-in users from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/bookings/:path*", "/barber/:path*", "/login", "/register"],
}
