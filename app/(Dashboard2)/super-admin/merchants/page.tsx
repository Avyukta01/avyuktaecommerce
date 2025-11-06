"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import apiClient from "@/lib/api";
import Link from "next/link";
import { toast } from "react-hot-toast";
// ✅ Correctly imported icons
import { FaStore, FaUserShield } from "react-icons/fa6";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";


interface Admin {
  id: string;
  email: string;
  role: string;
}

interface Merchant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  status: string;
  product: any[];
  adminMerchants?: Array<{ admin: Admin; assignedAt: string }>;
}

export default function SuperAdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ adminId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/merchants");
      if (response.ok) {
        const data = await response.json();
        setMerchants(data);
      }
    } catch (error) {
      toast.error("Failed to load merchants");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await apiClient.get("/api/admin/list");
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.filter((a: Admin) => a.role === "admin"));
      }
    } catch (error) {
      toast.error("Failed to load admins");
    }
  };

  useEffect(() => {
    fetchMerchants();
    fetchAdmins();
  }, []);

  // Search Handler
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Filter Merchants
  const filteredMerchants = useMemo(() => {
    if (!searchTerm) return merchants;

    return merchants.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [merchants, searchTerm]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMerchants = filteredMerchants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);

  const paginate = (page: number) => setCurrentPage(page);

  // CSV Export
  const handleDownload = () => {
    const headers = "Name,Email,Phone,Status,Assigned Admins,Products\n";
    const rows = filteredMerchants.map((m) => {
      const assigned = m.adminMerchants?.map(a => a.admin.email).join("; ") || "None";
      return `"${m.name}","${m.email || 'N/A'}","${m.phone || 'N/A'}",${m.status},"${assigned}",${m.product.length}`;
    }).join("\n");

    const csv = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.href = csv;
    link.download = "superadmin-merchants.csv";
    link.click();
  };

  // Delete
  const handleDelete = async (merchantId: string) => {
    if (!confirm("Delete this merchant permanently?")) return;
    try {
      const res = await apiClient.delete(`/api/merchants/${merchantId}`);
      if (!res.ok) throw new Error();
      toast.success("Merchant deleted");
      fetchMerchants();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Assign Admin
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
      toast.success("Assigned successfully");
      setShowAssignModal(false);
      fetchMerchants();
    } catch {
      toast.error("Assign failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unassign
  const handleUnassign = async (merchantId: string, adminId: string) => {
    if (!confirm("Unassign this admin?")) return;
    try {
      const res = await apiClient.delete("/api/admin/unassign-merchant", {
        adminId,
        merchantId,
      });
      if (!res.ok) throw new Error();
      toast.success("Unassigned");
      fetchMerchants();
    } catch {
      toast.error("Unassign failed");
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <div className="flex flex-col xl:pl-5 max-xl:px-5 w-full">
        <div className="w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <div className="pb-6 pt-4 border-b-2 border-gray-200 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin - All Merchants</h1>
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
                className="border border-gray-300 rounded-md px-6 py-2 text-sm font-medium bg-white"
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
                placeholder="Search merchants..."
                value={searchTerm}
                onChange={handleSearch}
                className="border border-gray-300 rounded-md px-4 py-2 text-sm placeholder-gray-500 bg-white focus:ring-2 focus:ring-blue-500"
              />
              <Link href="/super-admin/merchants/new">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                  Add Merchant
                </button>
              </Link>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase border-r border-blue-500">
                    Merchant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase border-r border-blue-500">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase border-r border-blue-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase border-r border-blue-500">
                    Assigned Admins
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 border-r"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4 border-r"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                      <td className="px-6 py-4 border-r"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4 border-r"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                    </tr>
                  ))
                ) : currentMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500 text-lg">
                      No merchants found
                    </td>
                  </tr>
                ) : (
                  currentMerchants.map((merchant) => (
                    <tr key={merchant.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 border-r text-sm font-medium text-gray-900 flex items-center gap-2">
                        <FaStore className="text-orange-500" />
                        {merchant.name}
                      </td>
                      <td className="px-6 py-4 border-r text-sm">
                        <div>{merchant.email || "N/A"}</div>
                        <div className="text-gray-500 text-xs">{merchant.phone || "No phone"}</div>
                      </td>
                      <td className="px-6 py-4 border-r">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          merchant.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {merchant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r text-sm">
                        <div className="space-y-1">
                          {merchant.adminMerchants?.length ? (
                            merchant.adminMerchants.map((am) => (
                              <div key={am.admin.id} className="flex items-center gap-2">
                                <FaUserShield className="text-blue-500 text-sm" />
                                <span>{am.admin.email}</span>
                                <button
                                  onClick={() => handleUnassign(merchant.id, am.admin.id)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Not assigned</span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedMerchant(merchant);
                              setAssignData({ adminId: "" });
                              setShowAssignModal(true);
                            }}
                            className="text-blue-600 text-xs hover:underline"
                          >
                            + Assign Admin
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-sm">
                          <Link href={`/super-admin/merchants/${merchant.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <FaEye /> ViewEdit
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(merchant.id)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 rounded-b-lg">
            <span className="text-sm text-gray-700">
              Showing <strong>{indexOfFirstItem + 1}</strong> - <strong>{Math.min(indexOfLastItem, filteredMerchants.length)}</strong> of <strong>{filteredMerchants.length}</strong>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-2 border rounded text-sm ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Assign Admin to {selectedMerchant.name}</h2>
            <form onSubmit={handleAssign}>
              <select
                required
                value={assignData.adminId}
                onChange={(e) => setAssignData({ adminId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose Admin</option>
                {admins
                  .filter(a => !selectedMerchant.adminMerchants?.some(am => am.admin.id === a.id))
                  .map(admin => (
                    <option key={admin.id} value={admin.id}>{admin.email}</option>
                  ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 border border-gray-300 rounded py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-70"
                >
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