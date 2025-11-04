import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    // Make admin login public - allow access without token
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
      return NextResponse.next();
    }

    // Protect super-admin routes - ONLY super_admin allowed (NOT admin, NOT user)
    if (pathname.startsWith('/super-admin')) {
      const userRole = token?.role;
      
      // If no token, redirect to login
      if (!token) {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('error', 'Please login');
        return NextResponse.redirect(loginUrl);
      }
      
      // ONLY super_admin role allowed
      if (userRole !== 'super_admin') {
        // If admin tries to access super-admin, redirect to admin dashboard
        if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
        // If normal user tries to access, redirect to home
        if (userRole === 'user' || !userRole) {
          return NextResponse.redirect(new URL('/', req.url));
        }
        // Other roles - deny access
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('error', 'AccessDenied');
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Protect ALL admin routes (except login) - ONLY admin allowed (NOT super_admin, NOT user)
    if (pathname.startsWith('/admin')) {
      const userRole = token?.role;
      
      // If no token at all, redirect to login
      if (!token) {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('error', 'Please login');
        return NextResponse.redirect(loginUrl);
      }
      
      // ONLY admin role allowed - super_admin and user should NOT access admin routes
      if (userRole !== 'admin') {
        // If super_admin tries to access admin routes, redirect to super-admin
        if (userRole === 'super_admin') {
          return NextResponse.redirect(new URL('/super-admin', req.url));
        }
        // If normal user tries to access admin routes, redirect to home
        if (userRole === 'user' || !userRole) {
          return NextResponse.redirect(new URL('/', req.url));
        }
        // Other roles - deny access
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('error', 'AccessDenied');
        return NextResponse.redirect(loginUrl);
      }
      
      // Valid admin token only
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public admin login page - always allow (no token required)
        if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
          return true;
        }

        // Super-admin routes require ONLY super_admin token (NOT admin, NOT user)
        if (pathname.startsWith('/super-admin')) {
          if (!token) return false;
          return token.role === 'super_admin';
        }

        // Admin routes (except login) require ONLY admin token (NOT super_admin, NOT user)
        if (pathname.startsWith('/admin')) {
          if (!token) return false; // Deny if no token
          // Only admin role allowed - super_admin and user should be redirected
          return token.role === 'admin';
        }

        // Default: deny access
        return false;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/super-admin",
    "/super-admin/:path*"
  ],
};
