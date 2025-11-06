"use client";
import AdminDashboardSidebar from "@/components/AdminDashboardSidebar";

import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isValidEmailAddressFormat } from "@/lib/utils";
import apiClient from "@/lib/api";

interface DashboardUserDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardSingleUserPage = ({ params }: DashboardUserDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [userInput, setUserInput] = useState({
    email: "",
    newPassword: "",
    role: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/api/admin/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user details");

        const data = await res.json();
        setUserInput({
          email: data?.email || "",
          newPassword: "",
          role: data?.role || "user",
        });
      } catch (err) {
        console.error("Error loading user:", err);
        toast.error("Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // ✅ Update user logic
  const updateUser = async () => {
    if (!userInput.email || !userInput.role) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!isValidEmailAddressFormat(userInput.email)) {
      toast.error("Invalid email format");
      return;
    }

    if (userInput.newPassword && userInput.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsSaving(true);
      const body: any = {
        email: userInput.email,
        role: userInput.role,
      };

      // Include password only if changed
      if (userInput.newPassword) body.password = userInput.newPassword;

      const res = await apiClient.put(`/api/admin/${id}`, body);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error while updating user");
      }

      toast.success("User updated successfully");
      setUserInput((prev) => ({ ...prev, newPassword: "" }));
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Delete user logic
  const deleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setIsDeleting(true);
      const res = await apiClient.delete(`/api/admin/${id}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      router.push("/super-admin/users");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error?.message || "Error while deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading user details...
      </div>
    );
  }

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <AdminDashboardSidebar />

      <div className="flex flex-col items-center justify-center xl:pl-5 max-xl:px-5 w-full py-8">
        {/* Professional Card */}
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            User Details
          </h1>

          {/* Email Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="user@example.com"
              value={userInput.email}
              onChange={(e) =>
                setUserInput({ ...userInput, email: e.target.value })
              }
            />
          </div>

          {/* New Password Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Leave blank to keep current"
              value={userInput.newPassword}
              onChange={(e) =>
                setUserInput({ ...userInput, newPassword: e.target.value })
              }
            />
          </div>

          {/* Role Select */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Role
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={userInput.role}
              onChange={(e) =>
                setUserInput({ ...userInput, role: e.target.value })
              }
            >
              <option value="admin">Admin</option>
              
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 max-sm:flex-col">
            <button
              type="button"
              disabled={isSaving}
              className={`flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={updateUser}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.414 2.586a2 2 0 00-2.828 0l-8 8a2 2 0 00-.586 1.414v4a1 1 0 001 1h4a2 2 0 001.414-.586l8-8a2 2 0 000-2.828z" />
                    <path d="M5 13h2v2H5v-2z" />
                  </svg>
                  Update User
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isDeleting}
              className={`flex-1 px-6 py-2.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                isDeleting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={deleteUser}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSingleUserPage;
