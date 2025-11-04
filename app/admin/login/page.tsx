"use client";
import { CustomButton } from "@/components";
import { isValidEmailAddressFormat } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminLoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    // Check if session expired
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setError("Your session has expired. Please log in again.");
      toast.error("Your session has expired. Please log in again.");
    }
    
    // Check access denied error
    const accessDenied = searchParams.get('error');
    if (accessDenied === 'AccessDenied') {
      setError("Access denied. Admin or SuperAdmin credentials required.");
      toast.error("Access denied");
    }
    
    // If admin/superAdmin has already logged in, redirect to appropriate dashboard
    if (sessionStatus === "authenticated" && session?.user) {
      const userRole = (session as any)?.user?.role;
      if (userRole === "super_admin") {
        router.replace("/super-admin");
      } else if (userRole === "admin") {
        router.replace("/admin");
      } else {
        // If regular user tries to access admin login, redirect to regular login
        router.replace("/login");
      }
    }
  }, [sessionStatus, router, searchParams, session]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    if (!isValidEmailAddressFormat(email)) {
      setError("Email is invalid");
      toast.error("Email is invalid");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password is invalid");
      toast.error("Password is invalid");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      toast.error("Invalid email or password");
    } else {
      setError("");
      toast.success("Successful login");
      
      // Wait for session to update, then redirect based on role
      setTimeout(() => {
        fetch("/api/auth/session")
          .then((res) => res.json())
          .then((data) => {
            const role = (data?.user as any)?.role;
            // Redirect based on role
            if (role === "super_admin") {
              router.replace("/super-admin");
            } else if (role === "admin") {
              router.replace("/admin");
            } else {
              // Normal user - redirect to regular login page
              router.replace("/login");
            }
          })
          .catch(() => {
            router.replace("/admin/login");
          });
      }, 200);
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-lg px-8 py-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <CustomButton
                buttonType="submit"
                text="Sign in as Admin"
                paddingX={3}
                paddingY={2}
                customWidth="full"
                textSize="sm"
              />
            </div>
          </form>

          {error && (
            <div className="mt-4">
              <p className="text-red-600 text-center text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Regular user?
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <a
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Go to user login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

