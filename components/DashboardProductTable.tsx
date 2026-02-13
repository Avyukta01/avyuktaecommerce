"use client";

import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Link from "next/link";
import Image from "next/image";
import { sanitize } from "@/lib/sanitize";

type Product = {
  id: string;
  title: string;
  manufacturer: string;
  inStock: number;
  price: number;
  mainImage?: string;
  category?: { name: string };
  merchant?: { name: string };
};

type ColKey =
  | "title"
  | "manufacturer"
  | "category"
  | "merchant"
  | "inStock"
  | "price";

const DashboardProductTable = () => {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [globalSearch, setGlobalSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<Record<ColKey, string>>({
    title: "",
    manufacturer: "",
    category: "",
    merchant: "",
    inStock: "",
    price: "",
  });

  const [visible, setVisible] = useState<Record<ColKey, boolean>>({
    title: true,
    manufacturer: true,
    category: true,
    merchant: true,
    inStock: true,
    price: true,
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setGlobalSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Products
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/products?mode=admin", {
          cache: "no-store",
        });
        const data: Product[] = await res.json();
        setRows(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Process Data
  const processed = useMemo(() => {
    let d = [...rows];

    // Column filters
    d = d.filter((r) => {
      return (
        sanitize(r.title)
          .toLowerCase()
          .includes(filters.title.toLowerCase()) &&
        sanitize(r.manufacturer)
          .toLowerCase()
          .includes(filters.manufacturer.toLowerCase()) &&
        (r.category?.name || "")
          .toLowerCase()
          .includes(filters.category.toLowerCase()) &&
        (r.merchant?.name || "")
          .toLowerCase()
          .includes(filters.merchant.toLowerCase()) &&
        r.inStock.toString().includes(filters.inStock) &&
        r.price.toString().includes(filters.price)
      );
    });

    // Global search
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      d = d.filter(
        (r) =>
          sanitize(r.title).toLowerCase().includes(q) ||
          sanitize(r.manufacturer).toLowerCase().includes(q) ||
          (r.category?.name || "").toLowerCase().includes(q) ||
          (r.merchant?.name || "").toLowerCase().includes(q) ||
          r.inStock.toString().includes(q) ||
          r.price.toString().includes(q)
      );
    }

    // Sorting
    if (sortCol) {
      d.sort((a, b) => {
        let A: any = a[sortCol];
        let B: any = b[sortCol];

        if (sortCol === "category") A = a.category?.name || "";
        if (sortCol === "merchant") A = a.merchant?.name || "";

        if (sortCol === "price" || sortCol === "inStock") {
          A = Number(A);
          B = Number(B);
        } else {
          A = String(A).toLowerCase();
          B = String(B).toLowerCase();
        }

        return (A < B ? -1 : A > B ? 1 : 0) *
          (sortDir === "asc" ? 1 : -1);
      });
    }

    return d;
  }, [rows, filters, globalSearch, sortCol, sortDir]);

  const total = processed.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const pageData = useMemo(
    () => processed.slice((page - 1) * perPage, page * perPage),
    [processed, page, perPage]
  );

  const visibleKeys = (
    ["title", "manufacturer", "category", "merchant", "inStock", "price"] as ColKey[]
  ).filter((k) => visible[k]);

  // Excel (Backend)
  const exportExcel = async () => {
    const res = await fetch("/api/products/export");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "products.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  // CSV (Pure JS)
  const exportCSV = () => {
    const header = visibleKeys
      .map((k) => (k === "inStock" ? "Stock" : k))
      .join(",");

    const rows = processed.map((r) =>
      visibleKeys
        .map((k) => {
          if (k === "category") return r.category?.name || "N/A";
          if (k === "merchant") return r.merchant?.name || "N/A";
          if (k === "price") return r.price.toString();
          if (k === "title")
            return `"${sanitize(r.title).replace(/"/g, '""')}"`;
          return String((r as any)[k]);
        })
        .join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const head = [visibleKeys];
    const body = processed.map((r) =>
      visibleKeys.map((k) => {
        if (k === "category") return r.category?.name || "N/A";
        if (k === "merchant") return r.merchant?.name || "N/A";
        if (k === "price") return `₹${r.price}`;
        if (k === "title") return sanitize(r.title);
        return (r as any)[k];
      })
    );
    (doc as any).autoTable({ head, body });
    doc.save("products.pdf");
  };

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded">
          Excel
        </button>
        <button onClick={exportCSV} className="bg-blue-600 text-white px-3 py-1 rounded">
          CSV
        </button>
        <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded">
          PDF
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            {visibleKeys.map((k) => (
              <th key={k} className="border px-2 py-1 capitalize">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.map((r) => (
            <tr key={r.id}>
              {visibleKeys.map((k) => (
                <td key={k} className="border px-2 py-1">
                  {k === "category"
                    ? r.category?.name
                    : k === "merchant"
                    ? r.merchant?.name
                    : k === "price"
                    ? `₹${r.price}`
                    : k === "title"
                    ? sanitize(r.title)
                    : (r as any)[k]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardProductTable;
