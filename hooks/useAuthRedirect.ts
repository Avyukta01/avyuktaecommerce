/**
 * Custom hook for role-based authentication and redirects
 * Handles client-side route protection and automatic redirects based on user role
 */

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

type UserRole = "user" | "admin" | "super_admin";

interface AuthRedirectOptions {
  /**
   * Required role to access the route
   * If user doesn't have this role, they'll be redirected
   */
  requiredRole?: UserRole | UserRole[];
  
  /**
   * Route to redirect to if user doesn't have required role
   */
  redirectTo?: string;
  
  /**
   * If true, only authenticated users can access (any role)
   */
  requireAuth?: boolean;
}

/**
 * Hook to handle role-based redirects after login
 * Automatically redirects users based on their role:
 * - user -> / (home page)
 * - admin -> /admin
 * - super_admin -> /super-admin
 */
export function useAuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any)?.role as UserRole;
      const pathname = window.location.pathname;

      // Skip redirect if already on correct page or on login pages
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/admin/login") ||
        pathname.startsWith("/register")
      ) {
        // Redirect based on role
        if (role === "super_admin" && !pathname.startsWith("/super-admin")) {
          router.replace("/super-admin");
        } else if (role === "admin" && !pathname.startsWith("/admin")) {
          router.replace("/admin");
        } else if (role === "user" && pathname.startsWith("/admin")) {
          router.replace("/");
        }
      }
    }
  }, [status, session, router]);
}

/**
 * Hook to protect routes based on user role
 * Use this in pages/components that require specific roles
 */
export function useRoleGuard(options: AuthRedirectOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const {
    requiredRole,
    redirectTo,
    requireAuth = false,
  } = options;

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return;

    // If authentication is required but user is not authenticated
    if (requireAuth && status === "unauthenticated") {
      router.replace(redirectTo || "/login");
      return;
    }

    // If user is authenticated, check role
    if (status === "authenticated" && session?.user && requiredRole) {
      const userRole = (session.user as any)?.role as UserRole;
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const hasRequiredRole = roles.includes(userRole);

      if (!hasRequiredRole) {
        // Redirect based on user's actual role
        if (userRole === "super_admin") {
          router.replace(redirectTo || "/super-admin");
        } else if (userRole === "admin") {
          router.replace(redirectTo || "/admin");
        } else {
          router.replace(redirectTo || "/");
        }
      }
    }
  }, [status, session, requiredRole, redirectTo, requireAuth, router, pathname]);

  return {
    user: session?.user,
    role: (session?.user as any)?.role as UserRole | undefined,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}

/**
 * Helper function to check if user has required role
 */
export function hasRole(userRole: string | undefined, requiredRole: UserRole | UserRole[]): boolean {
  if (!userRole) return false;
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(userRole as UserRole);
}

/**
 * Helper function to get redirect path based on role
 */
export function getRedirectPath(role: UserRole | undefined): string {
  switch (role) {
    case "super_admin":
      return "/super-admin";
    case "admin":
      return "/admin";
    case "user":
    default:
      return "/";
  }
}

