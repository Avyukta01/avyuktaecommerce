"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";

interface Merchant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  status: string;
  product: any[];
}

export default function MerchantPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/merchants");
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch merchants");
      }
      const data = await response.json();
      setMerchants(data);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      toast.error("Failed to load merchants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const filteredMerchants = useMemo(() => {
    if (!merchants) return [];
    if (!searchTerm) return merchants;
    
    return merchants.filter((merchant) =>
      merchant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant?.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [merchants, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMerchants = filteredMerchants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 p-10 overflow-y-auto">
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
              <Link
                href="/admin/merchant/new"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Add Merchant
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
                    Name
                    <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Email
                    <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Status
                    <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Products
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-4 py-4 border-b">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-4 py-4 border-b">
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-4 py-4 border-b">
                        <div className="w-40 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-4 py-4 border-b">
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-4 py-4 border-b">
                        <div className="w-12 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-4 py-4 border-b">
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : merchants.length > 0 ? (
                  currentMerchants.map((merchant) => (
                    <tr key={merchant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 border-b">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-4 py-4 border-b text-sm text-gray-900">
                        {merchant.name}
                      </td>
                      <td className="px-4 py-4 border-b text-sm text-gray-900">
                        {merchant.email || "N/A"}
                      </td>
                      <td className="px-4 py-4 border-b">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            merchant.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {merchant.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-b text-sm text-gray-900">
                        {merchant.product.length}
                      </td>
                      <td className="px-4 py-4 border-b">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/merchant/${merchant.id}`}
                            className="text-blue-500 hover:underline text-sm font-medium"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/merchant/${merchant.id}`}
                            className="text-blue-500 hover:underline text-sm font-medium"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500 border-b">
                      No merchants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
            <span className="text-sm text-gray-600">
              Showing <b>{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMerchants.length)}</b> of <b>{filteredMerchants.length}</b> entries
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
    </div>
  );
}