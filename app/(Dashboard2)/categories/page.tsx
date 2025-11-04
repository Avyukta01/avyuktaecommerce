"use client";
import { CustomButton } from "@/components";
import { nanoid } from "nanoid";
import Link from "next/link";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { formatCategoryName } from "../../../../utils/categoryFormating";
import apiClient from "@/lib/api";

import { Home, Category } from "@mui/icons-material";


interface Category {
  id: number;
  name: string;
}

const DashboardCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
 const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  
  useEffect(() => {

    apiClient
      .get("/api/categories")

    apiClient.get("/api/categories")

      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        return res.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchTerm) return categories;
    
    return categories.filter((category) =>
      formatCategoryName(category?.name)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // CSV Download
  const handleDownload = () => {
    const headers = "ID,Category Name\n";
    const rows = filteredCategories
      .map((c) => `${c.id},"${formatCategoryName(c?.name)}"`)
      .join("\n");
    const csvContent =
      "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);

    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "categories-table.csv";
    link.click();
  };

  // Refresh Handler
  const handleRefresh = () => {
    setIsLoading(true);
    apiClient
      .get("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="xl: w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <div className="pb-6 pt-4 border-b-2 border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">All Categories</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-6 py-2 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search categories..."
            className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 placeholder-gray-500 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Link href="/admin/categories/new">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Category
            </button>
          </Link>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </button>
          
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500 cursor-pointer hover:bg-blue-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Category Name
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : currentCategories.length > 0 ? (
              currentCategories.map((category: Category) => (
                <tr key={category.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-900 font-medium">
                    {formatCategoryName(category?.name)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/categories/${category?.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm text-gray-700 font-medium">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCategories.length)}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{filteredCategories.length}</span> entries
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Less than
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Greater than
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCategory;