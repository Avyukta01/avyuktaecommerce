"use client";
import React, { useEffect, useState, use } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  title: string;
  price: number;
  inStock: number;
}

interface Merchant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  status: string;
  product: Product[];
}

interface MerchantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MerchantDetailPage({
  params,
}: MerchantDetailPageProps) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    status: "ACTIVE",
  });

  const router = useRouter();

  const fetchMerchant = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/merchants/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/merchant");
          return;
        }
        throw new Error("Failed to fetch merchant");
      }
      
      const data = await response.json();
      setMerchant(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        description: data.description || "",
        status: data.status || "ACTIVE",
      });
    } catch (error) {
      console.error("Error fetching merchant:", error);
      toast.error("Failed to load merchant details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchant();
  }, [id]); 

const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // This is the correct way to use apiClient.put
    // It should just take the URL and the data object
    const response = await apiClient.put(`/api/merchants/${id}`, formData);

    if (!response.ok) {
      throw new Error("Failed to update merchant");
    }

    toast.success("Merchant updated successfully");
    fetchMerchant(); // Refresh data
  } catch (error) {
    console.error("Error updating merchant:", error);
    toast.error("Failed to update merchant");
  }
};

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this merchant?")) {
      return;
    }
    
    try {
      const response = await apiClient.delete(`/api/merchants/${id}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete merchant");
      }
      
      toast.success("Merchant deleted successfully");
      router.push("/admin/merchant");
    } catch (error) {
      console.error("Error deleting merchant:", error);
      toast.error(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "Failed to delete merchant"
          : "Failed to delete merchant"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 p-10 flex items-center justify-center">
          Loading merchant details...
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 p-10 flex items-center justify-center">
          Merchant not found
        </div>
      </div>
    );
  }

  return (
  <div className="flex h-screen bg-gray-50">
    <DashboardSidebar />
    
    {/* Main Content – No global scroll, let cards handle overflow */}
    <div className="flex-1 p-6 lg:p-10">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Merchant Details</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/merchant"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 active:scale-95 transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Merchants
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Merchant
          </button>
        </div>
      </div>

      {/* === MERCHANT DETAILS CARD === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Merchant Information</h2>
          <p className="text-sm text-gray-600 mt-1">Edit merchant details below</p>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Merchant Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                placeholder="Enter merchant name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                placeholder="merchant@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                placeholder="+91 9876543210"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                placeholder="123 Main St, City, State"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 h-32 resize-none"
                placeholder="Brief description of the merchant..."
              />
            </div>

            {/* Save Button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* === PRODUCTS CARD === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Merchant Products</h2>
          <p className="text-sm text-gray-600 mt-1">List of products associated with this merchant</p>
        </div>

        {/* Card Body with Scrollable Table */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {merchant.product.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">In Stock</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {merchant.product.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{product.title}</td>
                      <td className="px-6 py-4">${(product.price / 100).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.inStock ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/product/${product.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">No products for this merchant yet.</p>
          )}
        </div>
      </div>
    </div>
  </div>
);
}