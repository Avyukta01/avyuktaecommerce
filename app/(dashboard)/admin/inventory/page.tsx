"use client";

import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Link from "next/link";
import Image from "next/image";

type Inventory = {
  id: string;
  totalStock: number;
  currentStock: number;
  reservedStock: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    price: number;
    mainImage?: string;
  };
};

type ColKey = "product" | "totalStock" | "currentStock" | "reservedStock" | "sold" | "status";

const InventoryDashboard = () => {
  const [rows, setRows] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [globalSearch, setGlobalSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<Record<ColKey, string>>({
    product: "",
    totalStock: "",
    currentStock: "",
    reservedStock: "",
    sold: "",
    status: "",
  });

  const [visible, setVisible] = useState<Record<ColKey, boolean>>({
    product: true,
    totalStock: true,
    currentStock: true,
    reservedStock: true,
    sold: true,
    status: true,
  });
  const [colMenuOpen, setColMenuOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setGlobalSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch
// Fetch
// useEffect(() => {
//   (async () => {
//     try {
//       setLoading(true);

//       // FIX #1 → remove leading slash
//       const res = await apiClient.get("/api/inventory");

//       // FIX #2 → check response OK
//       if (!res.ok) {
//         console.error("API error:", res.status, res.statusText);
//         setRows([]);
//         return;
//       }

//       // FIX #3 → parse JSON correctly
//       const data = await res.json();

//       setRows(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   })();
// }, []);


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/inventory", { cache: "no-store" });
        const data: Inventory[] = await res.json();
        setRows(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);




  // Process + Derived Columns
  const processed = useMemo(() => {
    let d = [...rows].map((r) => {
      const sold = Math.max(r.totalStock - (r.currentStock + r.reservedStock), 0);
      const status =
        r.currentStock <= 0
          ? "Out of Stock"
          : r.currentStock < 10
          ? "Low Stock"
          : "In Stock";
      return { ...r, sold, status };
    });

    // Filters
    d = d.filter((r) => {
      const byProduct = r.product.title.toLowerCase().includes(filters.product.toLowerCase());
      const byTotal = r.totalStock.toString().includes(filters.totalStock);
      const byCurrent = r.currentStock.toString().includes(filters.currentStock);
      const byReserved = r.reservedStock.toString().includes(filters.reservedStock);
      const bySold = r.sold.toString().includes(filters.sold);
      const byStatus = r.status.toLowerCase().includes(filters.status.toLowerCase());
      return byProduct && byTotal && byCurrent && byReserved && bySold && byStatus;
    });

    // Global Search
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      d = d.filter(
        (r) =>
          r.product.title.toLowerCase().includes(q) ||
          r.totalStock.toString().includes(q) ||
          r.currentStock.toString().includes(q) ||
          r.reservedStock.toString().includes(q) ||
          r.sold.toString().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortCol) {
      d.sort((a, b) => {
        let A: any = sortCol === "product" ? a.product.title.toLowerCase() : a[sortCol];
        let B: any = sortCol === "product" ? b.product.title.toLowerCase() : b[sortCol];
        if (typeof A === "string") A = A.toLowerCase();
        if (typeof B === "string") B = B.toLowerCase();
        return (A < B ? -1 : A > B ? 1 : 0) * (sortDir === "asc" ? 1 : -1);
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

  const toggleSort = (c: ColKey) => {
    if (sortCol === c) setSortDir((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortCol(c);
      setSortDir("asc");
    }
  };

  const arrow = (c: ColKey) =>
    sortCol !== c ? (
      <span className="opacity-40 text-xs">Up/Down</span>
    ) : sortDir === "asc" ? (
      <span>Up</span>
    ) : (
      <span>Down</span>
    );

  const visibleKeys = (["product", "totalStock", "currentStock", "reservedStock", "sold", "status"] as ColKey[]).filter(
    (k) => visible[k]
  );

  const dataForExport = processed.map((r) => ({
    Product: r.product.title,
    "Total Stock": r.totalStock,
    "Current Stock": r.currentStock,
    "Reserved Stock": r.reservedStock,
    Sold: r.sold,
    Status: r.status,
  }));

  // Export Functions
  const copyToClipboard = async () => {
    const header = visibleKeys.map((k) => k[0].toUpperCase() + k.slice(1).replace(/([A-Z])/g, " $1")).join("\t");
    const body = processed
      .map((r) =>
        visibleKeys
          .map((k) => {
            if (k === "product") return r.product.title;
            if (k === "status") return r.status;
            return (r as any)[k];
          })
          .join("\t")
      )
      .join("\n");
    await navigator.clipboard.writeText(header + "\n" + body);
    alert("Copied to clipboard!");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory.xlsx");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const head = [["Product", "Total", "Current", "Reserved", "Sold", "Status"]];
    const body = processed.map((r) => [
      r.product.title,
      r.totalStock,
      r.currentStock,
      r.reservedStock,
      r.sold,
      r.status,
    ]);
    (doc as any).autoTable({ head, body, theme: "grid" });
    doc.save("inventory.pdf");
  };

  const doPrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const body = processed
      .map(
        (r) => `
      <tr>
        <td>${r.product.title}</td>
        <td>${r.totalStock}</td>
        <td>${r.currentStock}</td>
        <td>${r.reservedStock}</td>
        <td>${r.sold}</td>
        <td>${r.status}</td>
        <td><a href="/admin/inventory/${r.id}">View</a></td>
      </tr>`
      )
      .join("");
    w.document.write(`
      <html><head><title>Inventory</title>
      <style>table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:12px;text-align:left;}th{background:#1e40af;color:white;}</style>
      </head><body><h1>Inventory Report</h1>
      <table><tr><th>Product</th><th>Total</th><th>Current</th><th>Reserved</th><th>Sold</th><th>Status</th><th>Action</th></tr>${body}</table>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 500);
  };

  const Toolbar = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          Copy
        </button>
        <button
          onClick={exportExcel}
          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
        >
          Excel
        </button>
        <button
          onClick={exportCSV}
          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
        >
          CSV
        </button>
        <button
          onClick={exportPDF}
          className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
        >
          PDF
        </button>
        <button
          onClick={doPrint}
          className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium"
        >
          Print
        </button>

        <div className="relative">
          <button
            onClick={() => setColMenuOpen((s) => !s)}
            className="px-3 py-1.5 rounded bg-yellow-100 hover:bg-yellow-200 text-sm font-semibold"
          >
            Columns
          </button>
          {colMenuOpen && (
            <div
              className="absolute z-10 mt-2 w-48 rounded border border-gray-200 bg-white shadow-lg p-3"
              onMouseLeave={() => setColMenuOpen(false)}
            >
              {(["product", "totalStock", "currentStock", "reservedStock", "sold", "status"] as ColKey[]).map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-2 py-1.5 text-sm cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={visible[k]}
                    onChange={() => setVisible((v) => ({ ...v, [k]: !v[k] }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="capitalize">
                    {k === "totalStock" ? "Total Stock" : k === "currentStock" ? "Current Stock" : k === "reservedStock" ? "Reserved Stock" : k}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setPage(1);
        }}
        placeholder="Search all columns..."
        className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );

  const Header = (
    <thead>
      <tr className="bg-gray-50 border-b-2 border-gray-300 text-gray-900 text-xs font-bold uppercase tracking-wider">
        {visible.product && (
          <th
            className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition"
            onClick={() => toggleSort("product")}
          >
            <div className="flex items-center gap-1">Product {arrow("product")}</div>
          </th>
        )}
        {visible.totalStock && (
          <th
            className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition"
            onClick={() => toggleSort("totalStock")}
          >
            <div className="flex items-center gap-1">TotalStock {arrow("totalStock")}</div>
          </th>
        )}
        {visible.currentStock && (
          <th
            className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition"
            onClick={() => toggleSort("currentStock")}
          >
            <div className="flex items-center gap-1">CurrentStock {arrow("currentStock")}</div>
          </th>
        )}
        {visible.reservedStock && (
          <th
            className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition"
            onClick={() => toggleSort("reservedStock")}
          >
            <div className="flex items-center gap-1">ReservedStock {arrow("reservedStock")}</div>
          </th>
        )}
        {visible.sold && (
          <th
            className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition"
            onClick={() => toggleSort("sold")}
          >
            <div className="flex items-center gap-1">SoldStock {arrow("sold")}</div>
          </th>
        )}
        {visible.status && (
          <th
            className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition"
            onClick={() => toggleSort("status")}
          >
            <div className="flex items-center gap-1">Status {arrow("status")}</div>
          </th>
        )}
        <th className="px-4 py-3 text-left">Actions</th>
      </tr>

      <tr className="bg-gray-50 text-xs">
        {visible.product && (
          <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">
            <input
              value={filters.product}
              onChange={(e) => {
                setFilters((f) => ({ ...f, product: e.target.value }));
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded"
            />
          </th>
        )}
        {visible.totalStock && (
          <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">
            <input
              value={filters.totalStock}
              onChange={(e) => {
                setFilters((f) => ({ ...f, totalStock: e.target.value }));
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded"
            />
          </th>
        )}
        {visible.currentStock && (
          <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">
            <input
              value={filters.currentStock}
              onChange={(e) => {
                setFilters((f) => ({ ...f, currentStock: e.target.value }));
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded"
            />
          </th>
        )}
        {visible.reservedStock && (
          <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">
            <input
              value={filters.reservedStock}
              onChange={(e) => {
                setFilters((f) => ({ ...f, reservedStock: e.target.value }));
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded"
            />
          </th>
        )}
        {visible.sold && (
          <th className="px-4 py-3 border-r border-gray-200 last:border-r-0">
            <input
              value={filters.sold}
              onChange={(e) => {
                setFilters((f) => ({ ...f, sold: e.target.value }));
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded"
            />
          </th>
        )}
        {visible.status && (
          <th className="px-2 py-2">
            <input
              value={filters.status}
              onChange={(e) => {
                setFilters((f) => ({ ...f, status: e.target.value }));
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded"
            />
          </th>
        )}
        <th></th>
      </tr>
    </thead>
  );

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Inventory Management</h1>
        {/* <Link
          href="/admin/inventory/new"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Stock
        </Link> */}
      </div>
      <div className="border-t-2 border-gray-300 mb-6"></div>

      {Toolbar}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          {Header}
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {visibleKeys.map((k) => (
                    <td key={k} className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={visibleKeys.length + 1} className="text-center py-12 text-gray-500 font-medium">
                  No inventory found
                </td>
              </tr>
            ) : (
              pageData.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                  {visible.product && (
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-sm">
                      <div className="flex items-center gap-3">
                        <Image
                          src={r.product.mainImage ? `/${r.product.mainImage}` : "/product_placeholder.jpg"}
                          alt={r.product.title}
                          width={40}
                          height={40}
                          className="rounded border object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{r.product.title}</p>
                          <p className="text-xs text-gray-500">₹{r.product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                  )}
                  {visible.totalStock && <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-sm font-mono">{r.totalStock}</td>}
                  {visible.currentStock && <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-sm font-mono">{r.currentStock}</td>}
                  {visible.reservedStock && <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-sm font-mono">{r.reservedStock}</td>}
                  {visible.sold && <td className="px-4 py-3 border-r border-gray-200 last:border-r-0text-sm font-mono text-green-600 font-bold">{r.sold}</td>}
                  {visible.status && (
                    <td className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          r.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : r.status === "Low Stock"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-sm">
                    <Link
                      href={`/admin/inventory/${r.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-sm text-gray-700">
        <div className="flex items-center gap-3">
          <span>Rows per page:</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded px-7 py-1.5"
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>
            {total === 0
              ? "0–0 of 0"
              : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-7 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 7)
            .map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-4 py-2 border rounded-lg ${n === page ? "bg-blue-600 text-white" : "hover:bg-gray-50"}`}
              >
                {n}
              </button>
            ))}
          <button
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;