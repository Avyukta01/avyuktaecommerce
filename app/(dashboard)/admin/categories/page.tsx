"use client";
import { CustomButton } from "@/components";
import { nanoid } from "nanoid";
import Link from "next/link";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { formatCategoryName } from "../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import { Home, Category } from "@mui/icons-material";

const DashboardCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const itemsPerPage = 5;

  // getting all categories to be displayed on the all categories page
  useEffect(() => {
    apiClient
      .get("/api/categories")
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
        // You could add toast notification here if needed
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

  // 📥 CSV Download
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

  // 🔄 Refresh Handler
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
    <div className="space-y-6">
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Data Tables</h1>
          <p className="text-gray-600">Default Datatable</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Row Per Page</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">Entries</span>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-300 rounded px-3 py-1 text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Link href="/admin/categories/new">
              <button className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
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
                Add Category
              </button>
            </Link>
            <button
              onClick={handleDownload}
              className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Category Name
                  <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4 border-b">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-4 border-b">
                      <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-4 border-b">
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : (
                categories &&
                currentCategories.map((category: Category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 border-b">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-4 border-b text-sm text-gray-900">
                      {formatCategoryName(category?.name)}
                    </td>
                    <td className="px-4 py-4 border-b">
                      <Link
                        href={`/admin/categories/${category?.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600">
            Showing <b>{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCategories.length)}</b> of <b>{filteredCategories.length}</b> entries
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === i + 1
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCategory;