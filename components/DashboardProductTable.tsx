"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import apiClient from "@/lib/api";
import * as XLSX from "xlsx";
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

type ColKey = "title" | "manufacturer" | "category" | "merchant" | "inStock" | "price";

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
  const [colMenuOpen, setColMenuOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setGlobalSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Products
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/products?mode=admin", { cache: "no-store" });
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

    // Column Filters
    d = d.filter((r) => {
      const byTitle = sanitize(r.title).toLowerCase().includes(filters.title.toLowerCase());
      const byManu = sanitize(r.manufacturer).toLowerCase().includes(filters.manufacturer.toLowerCase());
      const byCat = (r.category?.name || "").toLowerCase().includes(filters.category.toLowerCase());
      const byMer = (r.merchant?.name || "").toLowerCase().includes(filters.merchant.toLowerCase());
      const byStock = r.inStock.toString().includes(filters.inStock);
      const byPrice = r.price.toString().includes(filters.price);
      return byTitle && byManu && byCat && byMer && byStock && byPrice;
    });

    // Global Search
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      d = d.filter((r) =>
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

        return (A < B ? -1 : A > B ? 1 : 0) * (sortDir === "asc" ? 1 : -1);
      });
    }

    return d;
  }, [rows, filters, globalSearch, sortCol, sortDir]);

  const total = processed.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const pageData = useMemo(() => processed.slice((page - 1) * perPage, page * perPage), [processed, page, perPage]);

  const toggleSort = (c: ColKey) => {
    if (sortCol === c) setSortDir(p => p === "asc" ? "desc" : "asc");
    else { setSortCol(c); setSortDir("asc"); }
  };

  const arrow = (c: ColKey) =>
    sortCol !== c ? (
      <span className="opacity-40 text-xs">Up/Down</span>
    ) : sortDir === "asc" ? (
      <span>Up</span>
    ) : (
      <span>Down</span>
    );

  const visibleKeys = (["title", "manufacturer", "category", "merchant", "inStock", "price"] as ColKey[]).filter(k => visible[k]);

  const dataForExport = processed.map(r => {
    const out: Record<string, string> = {};
    if (visible.title) out.Title = sanitize(r.title);
    if (visible.manufacturer) out.Manufacturer = sanitize(r.manufacturer);
    if (visible.category) out.Category = r.category?.name || "N/A";
    if (visible.merchant) out.Merchant = r.merchant?.name || "N/A";
    if (visible.inStock) out.Stock = r.inStock.toString();
    if (visible.price) out.Price = `₹${r.price.toLocaleString()}`;
    return out;
  });

  const copyToClipboard = async () => {
    const header = visibleKeys.map(k => k[0].toUpperCase() + k.slice(1)).join("\t");
    const body = processed.map(r => visibleKeys.map(k => {
      if (k === "category") return r.category?.name || "N/A";
      if (k === "merchant") return r.merchant?.name || "N/A";
      if (k === "price") return `₹${r.price.toLocaleString()}`;
      if (k === "title") return sanitize(r.title);
      return (r as any)[k];
    }).join("\t")).join("\n");
    await navigator.clipboard.writeText(header + "\n" + body);
    const btn = document.activeElement as HTMLButtonElement;
    const orig = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => btn.textContent = orig, 1500);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products.xlsx");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const head = visibleKeys.map(k => k[0].toUpperCase() + k.slice(1));
    const body = processed.map(r => visibleKeys.map(k => {
      if (k === "category") return r.category?.name || "N/A";
      if (k === "merchant") return r.merchant?.name || "N/A";
      if (k === "price") return `₹${r.price.toLocaleString()}`;
      if (k === "title") return sanitize(r.title);
      return (r as any)[k];
    }));
    (doc as any).autoTable({ head: [head], body, theme: "grid" });
    doc.save("products.pdf");
  };

  const doPrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const head = visibleKeys.map(k => `<th>${k[0].toUpperCase() + k.slice(1)}</th>`).join("");
    const body = processed.map(r => {
      const cells = visibleKeys.map(k => {
        if (k === "category") return r.category?.name || "N/A";
        if (k === "merchant") return r.merchant?.name || "N/A";
        if (k === "price") return `₹${r.price.toLocaleString()}`;
        if (k === "title") return sanitize(r.title);
        return (r as any)[k];
      }).map(c => `<td>${c}</td>`).join("");
      return `<tr>${cells}<td>View</td></tr>`;
    }).join("");
    w.document.write(`
      <html><head><title>Products</title>
      <style>table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#1e40af;color:white;}</style>
      </head><body><h1>Products</h1><table><tr>${head}<th>Actions</th></tr>${body}</table></body></html>
    `);
    w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close(); }, 500);
  };

  const Toolbar = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={copyToClipboard} className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium">Copy</button>
        <button onClick={exportExcel} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium">Excel</button>
        <button onClick={exportCSV} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">CSV</button>
        <button onClick={exportPDF} className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium">PDF</button>
        <button onClick={doPrint} className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium">Print</button>

        <div className="relative">
          <button onClick={() => setColMenuOpen(s => !s)} className="px-3 py-1.5 rounded bg-yellow-100 hover:bg-yellow-200 text-sm font-semibold">Columns</button>
          {colMenuOpen && (
            <div className="absolute z-10 mt-2 w-48 rounded border border-gray-200 bg-white shadow-lg p-3" onMouseLeave={() => setColMenuOpen(false)}>
              {(["title", "manufacturer", "category", "merchant", "inStock", "price"] as ColKey[]).map(k => (
                <label key={k} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer select-none">
                  <input type="checkbox" checked={visible[k]} onChange={() => setVisible(v => ({ ...v, [k]: !v[k] }))} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="capitalize">{k === "inStock" ? "Stock" : k}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        value={searchInput}
        onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
        placeholder="Search all columns..."
        className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );

  const Header = (
    <thead>
      <tr className="bg-gray-50 border-b-2 border-gray-300 text-gray-900 text-xs font-bold uppercase tracking-wider">
        {visible.title && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("title")}>
            <div className="flex items-center gap-1">Product {arrow("title")}</div>
          </th>
        )}
        {visible.manufacturer && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("manufacturer")}>
            <div className="flex items-center gap-1">Manufacturer {arrow("manufacturer")}</div>
          </th>
        )}
        {visible.category && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("category")}>
            <div className="flex items-center gap-1">Category {arrow("category")}</div>
          </th>
        )}
        {visible.merchant && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("merchant")}>
            <div className="flex items-center gap-1">Merchant {arrow("merchant")}</div>
          </th>
        )}
        {visible.inStock && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("inStock")}>
            <div className="flex items-center gap-1">Stock {arrow("inStock")}</div>
          </th>
        )}
        {visible.price && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("price")}>
            <div className="flex items-center gap-1">Price {arrow("price")}</div>
          </th>
        )}
        <th className="px-4 py-3 text-left">Actions</th>
      </tr>

      <tr className="bg-gray-50 text-xs">
        {visible.title && <th className="px-2 py-2"><input value={filters.title} onChange={e => { setFilters(f => ({ ...f, title: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.manufacturer && <th className="px-2 py-2"><input value={filters.manufacturer} onChange={e => { setFilters(f => ({ ...f, manufacturer: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.category && <th className="px-2 py-2"><input value={filters.category} onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.merchant && <th className="px-2 py-2"><input value={filters.merchant} onChange={e => { setFilters(f => ({ ...f, merchant: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.inStock && <th className="px-2 py-2"><input value={filters.inStock} onChange={e => { setFilters(f => ({ ...f, inStock: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.price && <th className="px-2 py-2"><input value={filters.price} onChange={e => { setFilters(f => ({ ...f, price: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        <th></th>
      </tr>
    </thead>
  );

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">All Products</h1>
        <Link href="/admin/products/new" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
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
                  {visibleKeys.map(k => (
                    <td key={k} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  ))}
                  <td className="px-4 py-4"><div className="h-8 w-20 bg-gray-200 rounded"></div></td>
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr><td colSpan={visibleKeys.length + 1} className="text-center py-12 text-gray-500 font-medium">No products found</td></tr>
            ) : (
              pageData.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                  {visible.title && (
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden border">
                          <Image width={40} height={40} src={r.mainImage ? `/${r.mainImage}` : "/product_placeholder.jpg"} alt="" className="object-cover" />
                        </div>
                        <span className="font-medium">{sanitize(r.title)}</span>
                      </div>
                    </td>
                  )}
                  {visible.manufacturer && <td className="px-4 py-3 text-sm text-gray-700">{sanitize(r.manufacturer)}</td>}
                  {visible.category && <td className="px-4 py-3 text-sm text-gray-700">{r.category?.name || "N/A"}</td>}
                  {visible.merchant && <td className="px-4 py-3 text-sm text-gray-700">{r.merchant?.name || "N/A"}</td>}
                  {visible.inStock && (
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.inStock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {r.inStock > 0 ? `In Stock (${r.inStock})` : "Out of Stock"}
                      </span>
                    </td>
                  )}
                  {visible.price && <td className="px-4 py-3 text-sm font-semibold">₹{r.price.toLocaleString()}</td>}
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/admin/products/${r.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-sm text-gray-700">
        <div className="flex items-center gap-3">
          <span>Rows per page:</span>
          <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="border border-gray-300 rounded px-7 py-1.5">
            {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>{total === 0 ? "0–0 of 0" : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`}</span>
        </div>
        <div className="flex items-center gap-1">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-7 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Prev</button>
          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 7)
            .map(n => (
              <button key={n} onClick={() => setPage(n)} className={`px-4 py-2 border rounded-lg ${n === page ? "bg-blue-600 text-white" : "hover:bg-gray-50"}`}>
                {n}
              </button>
            ))}
          <button disabled={page >= pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardProductTable;