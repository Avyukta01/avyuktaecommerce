"use client";
import { DashboardSidebar } from "@/components";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { convertCategoryNameToURLFriendly } from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api"; // ✅ keeps using your working baseURL config

const DashboardNewCategoryPage = () => {
  const [categoryInput, setCategoryInput] = useState<{
    name: string;
    image: File | null;
  }>({
    name: "",
    image: null,
  });

  const [preview, setPreview] = useState<string | null>(null);

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const addNewCategory = async () => {
    if (categoryInput.name.trim().length === 0) {
      toast.error("You need to enter a category name");
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        "name",
        convertCategoryNameToURLFriendly(categoryInput.name)
      );
      if (categoryInput.image) formData.append("image", categoryInput.image);

      // ✅ Use apiClient (Axios) with FormData — no manual headers
      const response = await apiClient.post(`/api/categories`, formData);

      if (response.status === 201) {
        toast.success("Category added successfully");
        setCategoryInput({ name: "", image: null });
        setPreview(null);
      } else {
        toast.error("There was an error while creating category");
      }
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast.error("There was an error while creating category");
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />

      <div className="flex flex-col items-center justify-center xl:pl-5 max-xl:px-5 w-full py-8">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Add New Category
          </h1>

          {/* Category Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
              value={categoryInput.name}
              onChange={(e) =>
                setCategoryInput({ ...categoryInput, name: e.target.value })
              }
            />
          </div>

          {/* Category Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCategoryInput({ ...categoryInput, image: file });
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md border mt-3 mx-auto"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="button"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={addNewCategory}
            >
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
              Create Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNewCategoryPage;
