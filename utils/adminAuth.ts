import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  // Not logged in -> go to admin login
  if (!session) {
    redirect("/admin/login");
  }
  
  // Only allow admin role - NOT super_admin
  const role = (session as any)?.user?.role;
  if (role !== "admin") {
    // If super_admin tries to access admin, redirect to super-admin
    if (role === "super_admin") {
      redirect("/super-admin");
    }
    // Other roles - deny access
    redirect("/admin/login?error=AccessDenied");
  }
  
  return session;
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  
  // Not logged in -> go to admin login
  if (!session) {
    redirect("/admin/login");
  }
  
  // Only allow super_admin
  const role = (session as any)?.user?.role;
  if (role !== "super_admin") {
    redirect("/admin/login?error=AccessDenied");
  }
  
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  return role === "admin";
}

export async function isSuperAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  return role === "super_admin";
}

export async function getSessionRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session as any)?.user?.role || null;
}

