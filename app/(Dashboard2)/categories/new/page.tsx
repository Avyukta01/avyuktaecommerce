"use client";
import { DashboardSidebar } from "@/components";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { convertCategoryNameToURLFriendly } from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";

const DashboardNewCategoryPage = () => {
  const [categoryInput, setCategoryInput] = useState({
    name: "",
  });

  const addNewCategory = async () => {
    if (categoryInput.name.length > 0) {
      try {
        const response = await apiClient.post(`/api/categories`, {
          name: convertCategoryNameToURLFriendly(categoryInput.name),
        });

        if (response.status === 201) {
          await response.json();
          toast.success("Category added successfully");
          setCategoryInput({
            name: "",
          });
        } else {
          const errorData = await response.json();
          toast.error(
            errorData.error || "There was an error while creating category"
          );
        }
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error("There was an error while creating category");
      }
    } else {
      toast.error("You need to enter values to add a category");
    }
  };
  return (
  <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
    <DashboardSidebar />
    
    <div className="flex flex-col items-center justify-center xl:pl-5 max-xl:px-5 w-full py-8">
      {/* Professional Card */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Add New Category
        </h1>

        {/* Form Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter category name"
            value={categoryInput.name}
            onChange={(e) =>
              setCategoryInput({ ...categoryInput, name: e.target.value })
            }
          />
        </div>

        {/* Professional Button */}
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