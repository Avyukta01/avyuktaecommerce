"use client";

import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaUserShield } from "react-icons/fa6";

type Admin = { id: string; email: string; role: string };
type Merchant = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  status: string;
  product: any[];
  adminMerchants?: Array<{ admin: Admin; assignedAt: string }>;
};

type ColKey = "name" | "email" | "status" | "assignedAdmins" | "products";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

export default function SuperAdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<Record<ColKey, string>>({
    name: "", email: "", status: "", assignedAdmins: "", products: ""
  });

  const [visible, setVisible] = useState<Record<ColKey, boolean>>({
    name: true, email: true, status: true, assignedAdmins: true, products: true
  });
  const [colMenuOpen, setColMenuOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ adminId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setGlobalSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [mRes, aRes] = await Promise.all([
          apiClient.get("/api/merchants"),
          apiClient.get("/api/admin/list")
        ]);
        if (mRes.ok) setMerchants(await mRes.json());
        if (aRes.ok) {
          const data = await aRes.json();
          setAdmins(data.filter((a: Admin) => a.role === "admin"));
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Process
  const processed = useMemo(() => {
    let d = [...merchants];

    // Filters
    d = d.filter(m => {
      const name = m.name.toLowerCase().includes(filters.name.toLowerCase());
      const email = (m.email || "").toLowerCase().includes(filters.email.toLowerCase());
      const status = m.status.toLowerCase().includes(filters.status.toLowerCase());
      const admins = (m.adminMerchants?.map(a => a.admin.email).join(" ") || "").toLowerCase().includes(filters.assignedAdmins.toLowerCase());
      const products = m.product.length.toString().includes(filters.products);
      return name && email && status && admins && products;
    });

    // Global Search
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      d = d.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        m.status.toLowerCase().includes(q) ||
        m.adminMerchants?.some(a => a.admin.email.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortCol) {
      d.sort((a, b) => {
        let A: any = a[sortCol];
        let B: any = b[sortCol];
        if (sortCol === "assignedAdmins") {
          A = a.adminMerchants?.length || 0;
          B = b.adminMerchants?.length || 0;
        } else if (sortCol === "products") {
          A = a.product.length;
          B = b.product.length;
        } else {
          A = String(A || "").toLowerCase();
          B = String(B || "").toLowerCase();
        }
        return (A < B ? -1 : A > B ? 1 : 0) * (sortDir === "asc" ? 1 : -1);
      });
    }
    return d;
  }, [merchants, filters, globalSearch, sortCol, sortDir]);

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

  const visibleKeys = (["name", "email", "status", "assignedAdmins", "products"] as ColKey[]).filter(k => visible[k]);

  const dataForExport = processed.map(m => ({
    Name: m.name,
    Email: m.email || "N/A",
    Phone: m.phone || "N/A",
    Status: m.status,
    "Assigned Admins": m.adminMerchants?.map(a => a.admin.email).join("; ") || "None",
    Products: m.product.length
  }));

  // Export Functions
  const copyToClipboard = async () => {
    const header = visibleKeys.map(k => k[0].toUpperCase() + k.slice(1)).join("\t");
    const body = processed.map(m => visibleKeys.map(k => {
      if (k === "assignedAdmins") return m.adminMerchants?.map(a => a.admin.email).join("; ") || "None";
      if (k === "products") return m.product.length;
      return (m as any)[k] || "N/A";
    }).join("\t")).join("\n");
    await navigator.clipboard.writeText(header + "\n" + body);
    toast.success("Copied!");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Merchants");
    XLSX.writeFile(wb, "merchants.xlsx");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "merchants.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const head = visibleKeys.map(k => k[0].toUpperCase() + k.slice(1));
    const body = processed.map(m => visibleKeys.map(k => {
      if (k === "assignedAdmins") return m.adminMerchants?.map(a => a.admin.email).join("; ") || "None";
      if (k === "products") return m.product.length;
      return (m as any)[k] || "N/A";
    }));
    (doc as any).autoTable({ head: [head], body, theme: "grid" });
    doc.save("merchants.pdf");
  };

  const doPrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const head = visibleKeys.map(k => `<th>${k[0].toUpperCase() + k.slice(1)}</th>`).join("");
    const body = processed.map(m => {
      const cells = visibleKeys.map(k => {
        if (k === "assignedAdmins") return m.adminMerchants?.map(a => a.admin.email).join("<br>") || "None";
        if (k === "products") return m.product.length;
        return (m as any)[k] || "N/A";
      }).map(c => `<td>${c}</td>`).join("");
      return `<tr>${cells}<td>View</td></tr>`;
    }).join("");
    w.document.write(`
      <html><head><title>Merchants</title>
      <style>table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#1e40af;color:white;}</style>
      </head><body><h1>Merchants</h1><table><tr>${head}<th>Actions</th></tr>${body}</table></body></html>
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
              {(["name", "email", "status", "assignedAdmins", "products"] as ColKey[]).map(k => (
                <label key={k} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer select-none">
                  <input type="checkbox" checked={visible[k]} onChange={() => setVisible(v => ({ ...v, [k]: !v[k] }))} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="capitalize">{k === "assignedAdmins" ? "Admins" : k === "products" ? "Products" : k}</span>
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
        {visible.name && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("name")}>
            <div className="flex items-center gap-1">Merchant {arrow("name")}</div>
          </th>
        )}
        {visible.email && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("email")}>
            <div className="flex items-center gap-1">Email {arrow("email")}</div>
          </th>
        )}
        {visible.status && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("status")}>
            <div className="flex items-center gap-1">Status {arrow("status")}</div>
          </th>
        )}
        {visible.assignedAdmins && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("assignedAdmins")}>
            <div className="flex items-center gap-1">Admins {arrow("assignedAdmins")}</div>
          </th>
        )}
        {visible.products && (
          <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleSort("products")}>
            <div className="flex items-center gap-1">Products {arrow("products")}</div>
          </th>
        )}
        <th className="px-4 py-3 text-left">Actions</th>
      </tr>

      <tr className="bg-gray-50 text-xs">
        {visible.name && <th className="px-2 py-2"><input value={filters.name} onChange={e => { setFilters(f => ({ ...f, name: e.target.value })); setPage(1); }} placeholder="Filter..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.email && <th className="px-2 py-2"><input value={filters.email} onChange={e => { setFilters(f => ({ ...f, email: e.target.value })); setPage(1); }} placeholder="Filter..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.status && <th className="px-2 py-2"><input value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} placeholder="Filter..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.assignedAdmins && <th className="px-2 py-2"><input value={filters.assignedAdmins} onChange={e => { setFilters(f => ({ ...f, assignedAdmins: e.target.value })); setPage(1); }} placeholder="Filter..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        {visible.products && <th className="px-2 py-2"><input value={filters.products} onChange={e => { setFilters(f => ({ ...f, products: e.target.value })); setPage(1); }} placeholder="Filter..." className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded" /></th>}
        <th></th>
      </tr>
    </thead>
  );

  // Assign & Unassign
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.adminId || !selectedMerchant) return toast.error("Select admin");
    setIsSubmitting(true);
    try {
      const res = await apiClient.post("/api/admin/assign-merchant", {
        adminId: assignData.adminId,
        merchantId: selectedMerchant.id,
      });
      if (!res.ok) throw new Error();
      toast.success("Assigned!");
      setShowAssignModal(false);
      setMerchants(prev => prev.map(m => m.id === selectedMerchant.id ? { ...m, adminMerchants: [...(m.adminMerchants || []), { admin: admins.find(a => a.id === assignData.adminId)!, assignedAt: new Date().toISOString() }] } : m));
    } catch { toast.error("Failed"); }
    finally { setIsSubmitting(false); }
  };

  const handleUnassign = async (merchantId: string, adminId: string) => {
    if (!confirm("Unassign admin?")) return;
    try {
      const res = await apiClient.delete("/api/admin/unassign-merchant", { adminId, merchantId });
      if (!res.ok) throw new Error();
      toast.success("Unassigned");
      setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, adminMerchants: m.adminMerchants?.filter(am => am.admin.id !== adminId) } : m));
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete permanently?")) return;
    try {
      const res = await apiClient.delete(`/api/merchants/${id}`);
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      setMerchants(prev => prev.filter(m => m.id !== id));
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Merchants Management</h1>
        <Link href="/super-admin/merchants/new" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Merchant
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
                    <td key={k} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  ))}
                  <td className="px-4 py-4"><div className="h-8 w-20 bg-gray-200 rounded"></div></td>
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr><td colSpan={visibleKeys.length + 1} className="text-center py-12 text-gray-500 font-medium">No merchants found</td></tr>
            ) : (
              pageData.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors duration-150">
                  {/* ONLY NAME + EMAIL (NO AVATAR) */}
                  {visible.name && (
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{m.name}</p>
                        {m.email && <p className="text-xs text-gray-500 mt-1">{m.email}</p>}
                      </div>
                    </td>
                  )}

                  {visible.email && <td className="px-4 py-3 text-sm text-gray-700">{m.email || "N/A"}</td>}
                  {visible.status && (
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[m.status] || "bg-gray-100 text-gray-800"}`}>
                        {m.status}
                      </span>
                    </td>
                  )}
                  {visible.assignedAdmins && (
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        {m.adminMerchants?.length ? m.adminMerchants.map(am => (
                          <div key={am.admin.id} className="flex items-center gap-2">
                            <FaUserShield className="text-blue-600 text-xs" />
                            <span className="text-xs">{am.admin.email}</span>
                            <button onClick={() => handleUnassign(m.id, am.admin.id)} className="text-red-500 hover:text-red-700 text-xs">×</button>
                          </div>
                        )) : <span className="text-gray-400 text-xs italic">None</span>}
                        <button onClick={() => { setSelectedMerchant(m); setShowAssignModal(true); }} className="text-blue-600 text-xs hover:underline">+ Assign</button>
                      </div>
                    </td>
                  )}
                  {visible.products && <td className="px-4 py-3 text-sm font-medium">{m.product.length}</td>}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-3">
                      <Link href={`/super-admin/merchants/${m.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">View Details</Link>
                      <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                    </div>
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

      {/* Assign Modal */}
      {showAssignModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Assign Admin</h2>
            <p className="text-gray-600 mb-4">Merchant: <strong>{selectedMerchant.name}</strong></p>
            <form onSubmit={handleAssign}>
              <select required value={assignData.adminId} onChange={e => setAssignData({ adminId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500">
                <option value="">Choose Admin</option>
                {admins.filter(a => !selectedMerchant.adminMerchants?.some(am => am.admin.id === a.id)).map(a => (
                  <option key={a.id} value={a.id}>{a.email}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 disabled:opacity-70">
                  {isSubmitting ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}