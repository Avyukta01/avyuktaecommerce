"use client";

import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Link from "next/link";

type Order = {
  id: number;
  name: string;
  country: string;
  status: string;
  total: number;
  dateTime: string;
};

type ColKey = "id" | "name" | "country" | "status" | "total" | "date";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [globalSearch, setGlobalSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<Record<ColKey, string>>({
    id: "", name: "", country: "", status: "", total: "", date: ""
  });

  const [visible, setVisible] = useState<Record<ColKey, boolean>>({
    id: true, name: true, country: true, status: true, total: true, date: true
  });
  const [colMenuOpen, setColMenuOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Debounce Search
  useEffect(() => {
    const t = setTimeout(() => setGlobalSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch Orders
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/orders");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setOrders(data?.orders || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Format Date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Process Data
  const processed = useMemo(() => {
    let d = [...orders];

    // Filters
    d = d.filter(o => {
      const id = o.id.toString().includes(filters.id);
      const name = o.name.toLowerCase().includes(filters.name.toLowerCase());
      const country = o.country.toLowerCase().includes(filters.country.toLowerCase());
      const status = o.status.toLowerCase().includes(filters.status.toLowerCase());
      const total = o.total.toString().includes(filters.total);
      const date = formatDate(o.dateTime).toLowerCase().includes(filters.date.toLowerCase());
      return id && name && country && status && total && date;
    });

    // Global Search
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      d = d.filter(o =>
        o.id.toString().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.country.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q) ||
        o.total.toString().includes(q) ||
        formatDate(o.dateTime).toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortCol) {
      d.sort((a, b) => {
        let A: any = a[sortCol];
        let B: any = b[sortCol];
        if (sortCol === "id" || sortCol === "total") { A = Number(A); B = Number(B); }
        else if (sortCol === "date") { A = new Date(a.dateTime); B = new Date(b.dateTime); }
        else { A = A.toLowerCase(); B = B.toLowerCase(); }
        return (A < B ? -1 : A > B ? 1 : 0) * (sortDir === "asc" ? 1 : -1);
      });
    }
    return d;
  }, [orders, filters, globalSearch, sortCol, sortDir]);

  const total = processed.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const pageData = useMemo(() => processed.slice((page - 1) * perPage, page * perPage), [processed, page, perPage]);

  const toggleSort = (c: ColKey) => {
    if (sortCol === c) setSortDir(p => p === "asc" ? "desc" : "asc");
    else { setSortCol(c); setSortDir("asc"); }
  };

  const arrow = (c: ColKey) =>
    sortCol !== c ? <span className="opacity-40 text-xs">Up/Down</span> :
      sortDir === "asc" ? <span>Up</span> : <span>Down</span>;

  const visibleKeys = (["id", "name", "country", "status", "total", "date"] as ColKey[]).filter(k => visible[k]);

  const dataForExport = processed.map(o => ({
    "Order ID": o.id,
    "Customer": o.name,
    "Country": o.country,
    "Status": o.status,
    "Total": `₹${o.total.toLocaleString()}`,
    "Date": formatDate(o.dateTime)
  }));

  // Export Functions
  const copyToClipboard = async () => {
    const header = visibleKeys.map(k => {
      const labels: Record<ColKey, string> = {
        id: "Order ID", name: "Customer", country: "Country",
        status: "Status", total: "Total", date: "Date"
      };
      return labels[k];
    }).join("\t");

    const body = processed.map(o => visibleKeys.map(k => {
      if (k === "id") return o.id;
      if (k === "total") return `₹${o.total.toLocaleString()}`;
      if (k === "date") return formatDate(o.dateTime);
      return (o[k] as string);
    }).join("\t")).join("\n");

    await navigator.clipboard.writeText(header + "\n" + body);
    alert("Copied to clipboard!");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "orders.xlsx");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orders.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const head = [["Order ID", "Customer", "Country", "Status", "Total", "Date"]];
    const body = processed.map(o => [
      o.id,
      o.name,
      o.country,
      o.status,
      `₹${o.total.toLocaleString()}`,
      formatDate(o.dateTime)
    ]);
    (doc as any).autoTable({ head, body, theme: "grid" });
    doc.save("orders.pdf");
  };

  const doPrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const body = processed.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.name}<br><small>${o.country}</small></td>
        <td><span class="status">${o.status}</span></td>
        <td>₹${o.total.toLocaleString()}</td>
        <td>${formatDate(o.dateTime)}</td>
        <td><a href="/admin/orders/${o.id}">View</a></td>
      </tr>
    `).join("");
    w.document.write(`
      <html><head><title>All Orders</title>
      <style>
        body{font-family:Arial; padding:20px;}
        table{border-collapse:collapse;width:100%;} 
        th,td{border:1px solid #ddd;padding:10px;text-align:left;}
        th{background:#1e40af;color:white;}
        .status{padding:4px 8px; border-radius:20px; font-size:11px;}
      </style>
      </head><body>
      <h1>All Orders</h1>
      <table>
        <tr><th>ID</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th><th>Action</th></tr>
        ${body}
      </table>
      </body></html>
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
              {(["id", "name", "country", "status", "total", "date"] as ColKey[]).map(k => (
                <label key={k} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer select-none">
                  <input type="checkbox" checked={visible[k]} onChange={() => setVisible(v => ({ ...v, [k]: !v[k] }))} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="capitalize">
                    {k === "id" ? "Order ID" : k === "total" ? "Total" : k === "date" ? "Date" : k}
                  </span>
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
        {visible.id && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("id")}>
            <div className="flex items-center gap-1">Order ID {arrow("id")}</div>
          </th>
        )}
        {visible.name && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("name")}>
            <div className="flex items-center gap-1">Customer {arrow("name")}</div>
          </th>
        )}
        {visible.country && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("country")}>
            <div className="flex items-center gap-1">Country {arrow("country")}</div>
          </th>
        )}
        {visible.status && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("status")}>
            <div className="flex items-center gap-1">Status {arrow("status")}</div>
          </th>
        )}
        {visible.total && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("total")}>
            <div className="flex items-center gap-1">Total {arrow("total")}</div>
          </th>
        )}
        {visible.date && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("date")}>
            <div className="flex items-center gap-1">Date {arrow("date")}</div>
          </th>
        )}
        <th className="px-4 py-3 text-left">Actions</th>
      </tr>

      <tr className="bg-gray-50 text-xs">
        {visible.id && <th className="px-4 py-3  border-r border-gray-300"><input value={filters.id} onChange={e => { setFilters(f => ({ ...f, id: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.name && <th className="px-4 py-3  border-r border-gray-300"><input value={filters.name} onChange={e => { setFilters(f => ({ ...f, name: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.country && <th className="px-4 py-3  border-r border-gray-300"><input value={filters.country} onChange={e => { setFilters(f => ({ ...f, country: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.status && <th className="px-4 py-3  border-r border-gray-300"><input value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.total && <th className="px-4 py-3  border-r border-gray-300"><input value={filters.total} onChange={e => { setFilters(f => ({ ...f, total: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.date && <th className="px-4 py-3  border-r border-gray-300"><input value={filters.date} onChange={e => { setFilters(f => ({ ...f, date: e.target.value })); setPage(1); }} placeholder="Search..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        <th></th>
      </tr>
    </thead>
  );

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">All Orders</h1>
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
                    <td key={k} className="px-4 py-3  border-r border-gray-300"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  ))}
                  <td className="px-4 py-3  border-r border-gray-300"><div className="h-8 w-20 bg-gray-200 rounded"></div></td>
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr><td colSpan={visibleKeys.length + 1} className="text-center py-12 text-gray-500 font-medium">No orders found</td></tr>
            ) : (
              pageData.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                  {visible.id && (
                    <td className="px-4 py-3  border-r borderpx-4 py-3  border-r border-gray-300 text-sm font-mono text-gray-700">#{order.id}</td>
                  )}
                  {visible.name && (
                    <td className="px-4 py-3  border-r borderpx-4 py-3  border-r border-gray-300 text-sm">
                      <span className="font-semibold text-gray-900">{order.name}</span>
                    </td>
                  )}
                  {visible.country && (
                    <td className="px-4 py-3  border-r borderpx-4 py-3  border-r border-gray-300 text-sm text-gray-700">{order.country}</td>
                  )}
                  {visible.status && (
                    <td className="px-4 py-3  border-r borderpx-4 py-3  border-r border-gray-300 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Delivered" ? "bg-green-100 text-green-800" :
                        order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  )}
                  {visible.total && (
                    <td className="px-4 py-3  border-r border-gray-300 text-sm font-semibold text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </td>
                  )}
                  {visible.date && (
                    <td className="px-4 py-3  border-r border-gray-300 text-sm text-gray-700">
                      {formatDate(order.dateTime)}
                    </td>
                  )}
                  <td className="px-4 py-3  border-r border-gray-300 text-sm">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
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

export default AdminOrders;