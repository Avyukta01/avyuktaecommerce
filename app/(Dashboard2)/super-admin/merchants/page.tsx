"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaStore } from "react-icons/fa6";
import Link from "next/link";

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
  createdAt: string;
  product: any[];
  adminMerchants?: Array<{
    admin: Admin;
    assignedAt: string;
  }>;
}

const SuperAdminMerchantsPage = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    status: "ACTIVE",
  });
  const [assignData, setAssignData] = useState({
    adminId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/merchants");
      if (response.ok) {
        const data = await response.json();
        setMerchants(data);
      }
    } catch (error) {
      console.error("Error fetching merchants:", error);
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
        // Filter only admin role users (not super_admin)
        setAdmins(data.filter((admin: Admin) => admin.role === "admin"));
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  useEffect(() => {
    fetchMerchants();
    fetchAdmins();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Merchant name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = selectedMerchant
        ? `/api/merchants/${selectedMerchant.id}`
        : "/api/merchants";
      const method = selectedMerchant ? "PUT" : "POST";

      const response = await apiClient[method.toLowerCase()](url, formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save merchant");
      }

      toast.success(
        selectedMerchant
          ? "Merchant updated successfully"
          : "Merchant created successfully"
      );
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedMerchant(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        description: "",
        status: "ACTIVE",
      });
      fetchMerchants();
    } catch (error: any) {
      console.error("Error saving merchant:", error);
      toast.error(error.message || "Failed to save merchant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setFormData({
      name: merchant.name,
      email: merchant.email || "",
      phone: merchant.phone || "",
      address: merchant.address || "",
      description: merchant.description || "",
      status: merchant.status,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (merchantId: string) => {
    if (!confirm("Are you sure you want to delete this merchant?")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/merchants/${merchantId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete merchant");
      }

      toast.success("Merchant deleted successfully");
      fetchMerchants();
    } catch (error: any) {
      console.error("Error deleting merchant:", error);
      toast.error(error.message || "Failed to delete merchant");
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignData.adminId || !selectedMerchant) {
      toast.error("Please select an admin");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/api/admin/assign-merchant", {
        adminId: assignData.adminId,
        merchantId: selectedMerchant.id,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign merchant");
      }

      toast.success("Merchant assigned to admin successfully");
      setShowAssignModal(false);
      setAssignData({ adminId: "" });
      setSelectedMerchant(null);
      fetchMerchants();
    } catch (error: any) {
      console.error("Error assigning merchant:", error);
      toast.error(error.message || "Failed to assign merchant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async (merchantId: string, adminId: string) => {
    if (!confirm("Are you sure you want to unassign this merchant from the admin?")) {
      return;
    }

    try {
      const response = await apiClient.delete("/api/admin/unassign-merchant", {
        adminId,
        merchantId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unassign merchant");
      }

      toast.success("Merchant unassigned successfully");
      fetchMerchants();
    } catch (error: any) {
      console.error("Error unassigning merchant:", error);
      toast.error(error.message || "Failed to unassign merchant");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Merchant Management</h1>
        <button
          onClick={() => {
            setSelectedMerchant(null);
            setFormData({
              name: "",
              email: "",
              phone: "",
              address: "",
              description: "",
              status: "ACTIVE",
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={16} />
          Add Merchant
        </button>
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading merchants...</div>
        ) : merchants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No merchants found. Create your first merchant.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Admins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <FaStore className="text-orange-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {merchant.name}
                          </div>
                          {merchant.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {merchant.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {merchant.email || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {merchant.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          merchant.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {merchant.product?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {merchant.adminMerchants && merchant.adminMerchants.length > 0 ? (
                          merchant.adminMerchants.map((am) => (
                            <div
                              key={am.admin.id}
                              className="flex items-center gap-2 text-xs"
                            >
                              <FaUserShield className="text-blue-500" size={12} />
                              <span className="text-gray-700">{am.admin.email}</span>
                              <button
                                onClick={() =>
                                  handleUnassign(merchant.id, am.admin.id)
                                }
                                className="text-red-500 hover:text-red-700"
                                title="Unassign"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Not assigned</span>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMerchant(merchant);
                            setAssignData({ adminId: "" });
                            setShowAssignModal(true);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          + Assign Admin
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(merchant)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                         
                        </button>
                        <button
                          onClick={() => handleDelete(merchant.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Merchant Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedMerchant ? "Edit Merchant" : "Add New Merchant"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedMerchant(null);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        address: "",
                        description: "",
                        status: "ACTIVE",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : selectedMerchant
                      ? "Update Merchant"
                      : "Create Merchant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Admin Modal */}
      {showAssignModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Assign Merchant to Admin
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Merchant: <strong>{selectedMerchant.name}</strong>
              </p>
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="adminId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Admin
                  </label>
                  <select
                    id="adminId"
                    name="adminId"
                    value={assignData.adminId}
                    onChange={(e) =>
                      setAssignData({ ...assignData, adminId: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose an admin...</option>
                    {admins
                      .filter(
                        (admin) =>
                          !selectedMerchant.adminMerchants?.some(
                            (am) => am.admin.id === admin.id
                          )
                      )
                      .map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.email}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedMerchant(null);
                      setAssignData({ adminId: "" });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Assigning..." : "Assign Merchant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminMerchantsPage;

