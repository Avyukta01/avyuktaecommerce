"use client";
import { nanoid } from "nanoid";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import CustomButton from "./CustomButton";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

interface Product {
  id: number;
  title: string;
  manufacturer: string;
  inStock: boolean;
  price: number;
  mainImage?: string;
}

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const itemsPerPage = 5;

  /* ------------------------------------------------------------------ */
  /* -------------------------- DATA FETCHING ------------------------- */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    apiClient
      .get("/api/products?mode=admin", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => setProducts(data || []))
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setIsLoading(false));
  }, []);

  /* ------------------------------------------------------------------ */
  /* --------------------------- SEARCH & FILTER ---------------------- */
  /* ------------------------------------------------------------------ */
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      (p) =>
        p.id.toString().includes(searchTerm) ||
        sanitize(p.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
        sanitize(p.manufacturer)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  /* ------------------------------------------------------------------ */
  /* --------------------------- PAGINATION -------------------------- */
  /* ------------------------------------------------------------------ */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginate = (page: number) => setCurrentPage(page);

  /* ------------------------------------------------------------------ */
  /* ----------------------------- CSV ------------------------------- */
  /* ------------------------------------------------------------------ */
  const handleDownload = () => {
    const headers = "ID,Title,Manufacturer,Stock,Price\n";
    const rows = filteredProducts
      .map(
        (p) =>
          `${p.id},"${sanitize(p.title)}","${sanitize(p.manufacturer)}",${
            p.inStock ? "In Stock" : "Out of Stock"
          },${p.price}`
      )
      .join("\n");
    const csv = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.href = csv;
    link.download = "products-table.csv";
    link.click();
  };

  /* ------------------------------------------------------------------ */
  /* ------------------------------ RENDER --------------------------- */
  /* ------------------------------------------------------------------ */
  return (
    <div className="xl: w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
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
              // NOTE: itemsPerPage is const, so we keep the same values
              // (you could make it mutable if needed)
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
            className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 placeholder-gray-500 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Link href="/admin/products/new">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center gap-2">
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
              Add Product
            </button>
          </Link>
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
            Download
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          {/* ---------- THEAD ---------- */}
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                Product
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

          {/* ---------- TBODY ---------- */}
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              /* ----- Skeleton ----- */
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                      <div>
                        <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="w-20 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={nanoid()} className="hover:bg-blue-50 transition-colors">
                  {/* Checkbox */}
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                  </td>

                  {/* Product (Image + Title + Manufacturer) */}
                  <td className="px-6 py-4 border-r border-gray-200 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                        <Image
                          width={48}
                          height={48}
                          src={product.mainImage ? `/${product.mainImage}` : "/product_placeholder.jpg"}
                          alt={sanitize(product.title) || "Product image"}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{sanitize(product.title)}</span>
                        <span className="text-xs text-gray-500">{sanitize(product.manufacturer)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Stock Badge */}
                  <td className="px-6 py-4 border-r border-gray-200">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-900 font-semibold">
                    ₹{product.price.toLocaleString()}
                  </td>

                  {/* Action Link */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Pagination ---------- */}
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

export default DashboardProductTable;