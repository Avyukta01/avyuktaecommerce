/**
 * Client-side Route Guard Component
 * Protects routes based on user roles
 * 
 * Usage:
 * <RouteGuard requiredRole="admin">
 *   <YourProtectedComponent />
 * </RouteGuard>
 */

"use client";

import { useRoleGuard } from "@/hooks/useAuthRedirect";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface RouteGuardProps {
  /**
   * Required role(s) to access this route
   * Can be a single role or array of roles
   */
  requiredRole?: "user" | "admin" | "super_admin" | Array<"user" | "admin" | "super_admin">;
  
  /**
   * Children to render if user has access
   */
  children: ReactNode;
  
  /**
   * Custom redirect path if access is denied
   * Default: redirects based on user's actual role
   */
  redirectTo?: string;
  
  /**
   * Loading component to show while checking authentication
   */
  loadingComponent?: ReactNode;
  
  /**
   * Component to show if access is denied
   */
  fallbackComponent?: ReactNode;
}

export default function RouteGuard({
  requiredRole,
  children,
  redirectTo,
  loadingComponent,
  fallbackComponent,
}: RouteGuardProps) {
  const { isLoading, isAuthenticated, role } = useRoleGuard({
    requiredRole,
    redirectTo,
    requireAuth: !!requiredRole,
  });

  // Show loading state
  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Check if user has required role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasAccess = role && roles.includes(role as any);

    if (!hasAccess) {
      return (
        <>
          {fallbackComponent || (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600">
                  You don't have permission to access this page.
                </p>
              </div>
            </div>
          )}
        </>
      );
    }
  }

  // User has access, render children
  return <>{children}</>;
}

