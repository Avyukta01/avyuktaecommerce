"use client";
import { DashboardSidebar } from "@/components";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { formatCategoryName } from "../../../../../utils/categoryFormating";
import { convertCategoryNameToURLFriendly } from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";

interface DashboardSingleCategoryProps {
  params: Promise<{ id: string }>;
}

const DashboardSingleCategory = ({ params }: DashboardSingleCategoryProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [categoryInput, setCategoryInput] = useState<{ name: string }>({
    name: "",
  });
  const router = useRouter();

  const deleteCategory = async () => {
    const requestOptions = {
      method: "DELETE",
    };
    // sending API request for deleting a category
    apiClient
      .delete(`/api/categories/${id}`, requestOptions)
      .then((response) => {
        if (response.status === 204) {
          toast.success("Category deleted successfully");
          router.push("/admin/categories");
        } else {
          throw Error("There was an error deleting a category");
        }
      })
      .catch((error) => {
        toast.error("There was an error deleting category");
      });
  };

  const updateCategory = async () => {
    if (categoryInput.name.length > 0) {
      try {
        const response = await apiClient.put(`/api/categories/${id}`, {
          name: convertCategoryNameToURLFriendly(categoryInput.name),
        });

        if (response.status === 200) {
          await response.json();
          toast.success("Category successfully updated");
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Error updating a category");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("There was an error while updating a category");
      }
    } else {
      toast.error("For updating a category you must enter all values");
      return;
    }
  };

  useEffect(() => {
    // sending API request for getting single categroy
    apiClient
      .get(`/api/categories/${id}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategoryInput({
          name: data?.name,
        });
      });
  }, [id]);

 return (
  <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
    <DashboardSidebar />
    
    <div className="flex flex-col items-center justify-center xl:pl-5 max-xl:px-5 w-full py-8">
      {/* Professional Card */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Category Details
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
            value={formatCategoryName(categoryInput.name)}
            onChange={(e) =>
              setCategoryInput({ ...categoryInput, name: e.target.value })
            }
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 max-sm:flex-col mb-5">
          <button
            type="button"
            className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={updateCategory}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0l-8 8a2 2 0 00-.586 1.414v4a1 1 0 001 1h4a2 2 0 001.414-.586l8-8a2 2 0 000-2.828z" />
              <path d="M5 13h2v2H5v-2z" />
            </svg>
            Update Category
          </button>

          <button
            type="button"
            className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={deleteCategory}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete Category
          </button>
        </div>

        {/* Warning Note */}
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center">
          <strong>Note:</strong> Deleting this category will permanently remove all associated products.
        </div>
      </div>
    </div>
  </div>
);
};

export default DashboardSingleCategory;
