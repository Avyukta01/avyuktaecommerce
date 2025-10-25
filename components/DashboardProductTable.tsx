"use client";
import { nanoid } from "nanoid";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import CustomButton from "./CustomButton";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const itemsPerPage = 5;

  useEffect(() => {
    apiClient
      .get("/api/products?mode=admin", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => setProducts(data || []))
      .catch((err) => {
        console.error("Error fetching products:", err);
        // You could add toast notification here if needed
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;
    
    return products.filter(
      (product) =>
        product?.id?.toString().includes(searchTerm) ||
        sanitize(product?.title)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sanitize(product?.manufacturer)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // 📥 CSV Download
  const handleDownload = () => {
    const headers = "ID,Title,Manufacturer,Stock,Price\n";
    const rows = filteredProducts
      .map(
        (p) =>
          `${p.id},"${sanitize(p?.title)}","${sanitize(p?.manufacturer)}",${
            p.inStock ? "In Stock" : "Out of Stock"
          },${p.price}`
      )
      .join("\n");
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(headers + rows);

    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "products-table.csv";
    link.click();
  };

  return (
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
          <Link href="/admin/products/new">
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
              Add Product
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
      <div className="overflow-x-auto rounded-xl border border-gray-300">
        {isLoading ? (
          <table className="min-w-full text-left border-collapse text-[15px] leading-[1.4]">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 uppercase text-[14px] font-semibold">
              <tr>
                <th className="px-5 py-3 border-r border-b border-gray-300">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                </th>
                <th className="px-5 py-3 border-r border-b border-gray-300">
                  Product
                </th>
                <th className="px-5 py-3 border-r border-b border-gray-300">
                  Stock
                </th>
                <th className="px-5 py-3 border-r border-b border-gray-300">
                  Price
                </th>
                <th className="px-5 py-3 text-center border-b border-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-5 py-3 border-r border-b border-gray-200">
                    <div className="w-5 h-5 bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="px-5 py-3 border-r border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                      <div>
                        <div className="w-24 h-4 bg-gray-200 rounded-md mb-1"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded-md"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 border-r border-b border-gray-200">
                    <div className="w-20 h-6 bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="px-5 py-3 border-r border-b border-gray-200">
                    <div className="w-12 h-4 bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="px-5 py-3 text-center border-b border-gray-200">
                    <div className="w-20 h-8 bg-gray-200 rounded-md mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full text-left border-collapse text-[15px] leading-[1.5]">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 uppercase text-[14px] font-semibold">
              <tr>
                <th className="px-5 py-3 border-r border-b border-gray-300">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                </th>
                <th className="px-5 py-3 border-r border-b border-gray-300">
                  Product
                </th>
                <th className="px-5 py-3 border-r border-b border-gray-300">
                  Stock
                </th>
                <th className="px-5 py-3 border-r border-b border-gray-300">
                  Price
                </th>
                <th className="px-5 py-3 text-center border-b border-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {products &&
                currentProducts.map((product) => (
                  <tr
                    key={nanoid()}
                    className="hover:bg-blue-50 transition-all duration-300"
                  >
                    <td className="px-5 py-3 align-middle border-r border-b border-gray-200">
                      <input type="checkbox" className="checkbox checkbox-sm" />
                    </td>

                    <td className="px-5 py-3 border-r border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                          <Image
                            width={48}
                            height={48}
                            src={
                              product?.mainImage
                                ? `/${product?.mainImage}`
                                : "/product_placeholder.jpg"
                            }
                            alt={sanitize(product?.title) || "Product image"}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-[15px]">
                            {sanitize(product?.title)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {sanitize(product?.manufacturer)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 border-r border-b border-gray-200">
                      {product?.inStock ? (
                        <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-md shadow-sm">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-md shadow-sm">
                          Out of Stock
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-gray-800 font-medium border-r border-b border-gray-200">
                      ₹{product?.price}
                    </td>

                    <td className="px-5 py-3 text-center border-b border-gray-200">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                      >
                        View Details
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>

            {/* Table Footer */}
            <tfoot className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 text-[14px] font-medium border-t border-gray-300">
              <tr>
                <td colSpan={5} className="px-5 py-3">
                  <div className="flex justify-between items-center">
                    <span>
                      Showing{" "}
                      <b>
                        {indexOfFirstItem + 1} -{" "}
                        {Math.min(indexOfLastItem, filteredProducts.length)}
                      </b>{" "}
                      of <b>{filteredProducts.length}</b> products
                    </span>
                    <div className="flex gap-1">
                      <button
                        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 transition-all"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`px-3 py-1 border rounded-md text-sm transition-all ${
                            currentPage === i + 1
                              ? "bg-blue-500 text-white border-blue-500"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 transition-all"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardProductTable;
