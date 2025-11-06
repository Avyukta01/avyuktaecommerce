"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import Image from "next/image";
import { nanoid } from "nanoid";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  manufacturer: string;
  inStock: number;
  price: number;
  mainImage?: string;
  category?: { name: string };
  merchant?: { name: string };
}

const SuperAdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    apiClient
      .get("/api/products?mode=admin", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setProducts(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.id.includes(term) ||
        sanitize(p.title).toLowerCase().includes(term) ||
        sanitize(p.manufacturer).toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginate = (page: number) => setCurrentPage(page);

  // Export to CSV
  const handleDownload = () => {
    const headers = [
      "ID",
      "Title",
      "Manufacturer",
      "Category",
      "Merchant",
      "Price",
      "Stock",
    ];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${sanitize(p.title).replace(/"/g, '""')}"`,
      `"${sanitize(p.manufacturer).replace(/"/g, '""')}"`,
      `"${(p.category?.name || "N/A").replace(/"/g, '""')}"`,
      `"${(p.merchant?.name || "N/A").replace(/"/g, '""')}"`,
      p.price,
      p.inStock,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `superadmin-products-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="pb-6 pt-4 border-b-2 border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">All Products</h1>
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 placeholder-gray-500 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Export Button */}
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
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
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                Manufacturer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                Merchant
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                      <div>
                        <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="w-20 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4 border-r border-gray-200">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50 transition-colors">
                  {/* Product */}
                  <td className="px-6 py-4 border-r border-gray-200 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                        <Image
                          width={48}
                          height={48}
                          src={product.mainImage ? `/${product.mainImage}` : "/product_placeholder.jpg"}
                          alt={sanitize(product.title)}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {sanitize(product.title)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-700">
                    {sanitize(product.manufacturer)}
                  </td>

                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-700">
                    {product.category?.name || "N/A"}
                  </td>

                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-700">
                    {product.merchant?.name || "N/A"}
                  </td>

                  <td className="px-6 py-4 border-r border-gray-200">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        product.inStock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock > 0
                        ? `In Stock (${product.inStock})`
                        : "Out of Stock"}
                    </span>
                  </td>

                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-900 font-semibold">
                    ₹{product.price.toLocaleString()}
                  </td>

                  {/* Fixed: Use Link for proper navigation */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/super-admin/products/${product.id}`}
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
                  No products found
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
            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProducts.length)}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{filteredProducts.length}</span> entries
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + Math.max(1, currentPage - 2);
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          }).filter(Boolean)}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminProductsPage;