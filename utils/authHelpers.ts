/**
 * Server-side authentication helpers
 * Use these in server components and API routes
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/auth";

/**
 * Get current user session (server-side)
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Get current user role (server-side)
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role as UserRole | null;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Require specific role - redirects if user doesn't have the role
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as any)?.role as UserRole;
  const roles = Array.isArray(role) ? role : [role];
  
  if (!roles.includes(userRole)) {
    // Redirect based on user's actual role
    if (userRole === "super_admin") {
      redirect("/super-admin");
    } else if (userRole === "admin") {
      redirect("/admin");
    } else {
      redirect("/");
    }
  }
  
  return session;
}

/**
 * Check if user has specific role (server-side)
 */
export async function hasRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session) return false;
  
  const userRole = (session.user as any)?.role as UserRole;
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  return roles.includes(userRole);
}

/**
 * Get redirect path based on user role
 */
export function getRoleRedirectPath(role: UserRole | null | undefined): string {
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

