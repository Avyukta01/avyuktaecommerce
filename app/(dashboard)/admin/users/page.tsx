"use client";
import { CustomButton } from "@/components";
import apiClient from "@/lib/api";
import { nanoid } from "nanoid";
import Link from "next/link";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Home, People } from "@mui/icons-material";

const DashboardUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    // sending API request for all users
    apiClient.get("/api/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        // You could add toast notification here if needed
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm) return users;
    
    return users.filter((user) =>
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
            <Link href="/admin/users/new">
              <CustomButton
                buttonType="button"
                customWidth="110px"
                paddingX={10}
                paddingY={5}
                textSize="base"
                text="Add new user"
              />
            </Link>
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
                  Email
                  <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Role
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
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-4 border-b">
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 border-b">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-4 border-b text-sm text-gray-900">
                      {user?.email}
                    </td>
                    <td className="px-4 py-4 border-b text-sm text-gray-900">
                      {user?.role}
                    </td>
                    <td className="px-4 py-4 border-b">
                      <Link
                        href={`/admin/users/${user?.id}`}
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
            Showing <b>{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)}</b> of <b>{filteredUsers.length}</b> entries
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

export default DashboardUsers;
