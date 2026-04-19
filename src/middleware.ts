import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  uid: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get the ID token from localStorage (stored as a cookie for middleware access)
  const token = request.cookies.get("firebaseToken")?.value;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/admin/login"];

  // Student-only routes
  const studentRoutes = ["/student", "/profile"];

  // Admin-only routes
  const adminRoutes = ["/admin"];

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if token exists
  if (!token) {
    // Redirect to login based on the route
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Decode token to get user info (in production, verify signature)
    const decoded = jwtDecode<DecodedToken>(token);

    // Store user id in headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.uid);

    // For admin routes, you would need to verify role from database
    // This is a simplified example
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      // In production, verify the user's role from the database
      // For now, we'll just allow if token exists
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Student routes
    if (studentRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // Invalid token
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
