"use client";
import AdminDashboardSidebar from "@/components/AdminDashboardSidebar";
import { isValidEmailAddressFormat } from "@/lib/utils";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { sanitizeFormData } from "@/lib/form-sanitize";
import apiClient from "@/lib/api";

const DashboardCreateNewUser = () => {
  const [userInput, setUserInput] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addNewUser = async () => {
    if (!userInput.email || !userInput.password) {
      toast.error("You must enter all input values to add a user");
      return;
    }

    if (!isValidEmailAddressFormat(userInput.email)) {
      toast.error("Invalid email format");
      return;
    }

    if (userInput.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ Sanitize before sending
      const sanitizedUserInput = sanitizeFormData(userInput);

      // ✅ Updated API endpoint for Super Admin user creation
      const response = await apiClient.post("/api/admin/create", sanitizedUserInput);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error while creating user");
      }

      const data = await response.json();
      toast.success(`User "${data.email}" created successfully`);

      // Reset form
      setUserInput({
        email: "",
        password: "",
        role: "admin",
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error?.message || "Error while creating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <AdminDashboardSidebar />

      <div className="flex flex-col items-center justify-center xl:pl-5 max-xl:px-5 w-full py-8">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Add New User
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

          {/* Password Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
              value={userInput.password}
              onChange={(e) =>
                setUserInput({ ...userInput, password: e.target.value })
              }
            />
          </div>

          {/* Role Select */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Role
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

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              type="button"
              disabled={isSubmitting}
              className={`px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={addNewUser}
            >
              {isSubmitting ? (
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
                  Creating...
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
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreateNewUser;
