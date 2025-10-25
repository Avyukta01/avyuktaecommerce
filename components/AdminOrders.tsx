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
    <div className="xl:ml-5 w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
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
          <button
            onClick={handleDownload}
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </button>
          <button 
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            onClick={fetchOrders}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                <input type="checkbox" className="rounded" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("id")}
              >
                Order ID
                <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("name")}
              >
                Name & Country
                <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("status")}
              >
                Status
                <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("total")}
              >
                Subtotal
                <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Date
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
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 border-b">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-4 py-4 border-b text-sm text-gray-900 font-semibold">
                    #{order.id}
                  </td>
                  <td className="px-4 py-4 border-b text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">{order.name}</span>
                      <span className="text-xs text-gray-500">{order.country}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
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
                  <td className="px-4 py-4 border-b text-sm text-gray-900 font-semibold">
                    ₹{order.total}
                  </td>
                  <td className="px-4 py-4 border-b text-sm text-gray-900">
                    {new Date(order.dateTime).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 border-b">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500 border-b">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
        <span className="text-sm text-gray-600">
          Showing <b>{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredOrders.length)}</b> of <b>{filteredOrders.length}</b> entries
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
  );
};

export default AdminOrders;