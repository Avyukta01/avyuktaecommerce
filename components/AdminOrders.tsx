"use client";

// *********************
// Role: Admin dashboard table to display all orders
// Name: AdminOrders.tsx
// Developer: Aleksandar Kuzmanovic (Upgraded by Dinesh Singh)
// Version: 2.0 (Production UI)
// *********************

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CustomButton from "@/components/CustomButton";
import apiClient from "@/lib/api";
import '../components/styles/buttonstyle.css';

interface Order {
  id: number;
  name: string;
  country: string;
  status: string;
  total: number;
  dateTime: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 5;

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/api/orders");
      const data = await response.json();
      setOrders(data?.orders || []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔍 Optimized search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // 🔃 Sort handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // 🔢 Sorting logic
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (a[sortKey as keyof Order] && b[sortKey as keyof Order]) {
        if (sortOrder === "asc") {
          return a[sortKey as keyof Order] > b[sortKey as keyof Order] ? 1 : -1;
        }
        return a[sortKey as keyof Order] < b[sortKey as keyof Order] ? 1 : -1;
      }
      return 0;
    });
  }, [orders, sortKey, sortOrder]);

  // 🔍 Filter logic with memoization
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return sortedOrders;
    
    return sortedOrders.filter(
      (order) =>
        order.id.toString().includes(searchTerm) ||
        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedOrders, searchTerm]);

  // 🔢 Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // 📥 CSV Download
  const handleDownload = () => {
    const headers = "ID,Name,Country,Status,Total,Date\n";
    const rows = filteredOrders
      .map(
        (o) =>
          `${o.id},"${o.name}","${o.country}",${o.status},${o.total},"${new Date(
            o.dateTime
          ).toLocaleString()}"`
      )
      .join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);

    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "orders-table.csv";
    link.click();
  };

  return (
    <div className="xl: w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <div className="pb-6 pt-4 border-b-2 border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">All Orders</h1>
        {/* <p className="text-sm text-gray-600">D</p> */}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
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
            placeholder="Search orders..."
            className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 placeholder-gray-500 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            onClick={fetchOrders}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-3 mb-4 text-sm">{error}</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500 cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center gap-2">
                  Order ID
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500 cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Name & Country
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500 cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500 cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => handleSort("total")}
              >
                <div className="flex items-center gap-2">
                  Subtotal
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
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
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-900 font-semibold">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{order.name}</span>
                      <span className="text-xs text-gray-500">{order.country}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-900 font-semibold">
                    ₹{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-700">
                    {new Date(order.dateTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6  p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm text-gray-700 font-medium">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, sortedOrders.length)}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{sortedOrders.length}</span> entries
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            &lt;
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
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;