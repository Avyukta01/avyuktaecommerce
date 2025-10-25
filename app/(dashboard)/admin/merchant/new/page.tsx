"use client";
import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";

export default function NewMerchantPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    status: "ACTIVE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    
    if (!formData.name.trim()) {
      toast.error("Merchant name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post("/api/merchants", formData);

      if (!response.ok) {
        let details = "";
        try {
          const errJson = await response.json();
          details = errJson?.details || errJson?.error || errJson?.message || "";
        } catch {
          try {
            details = await response.text();
          } catch {}
        }
        throw new Error(details ? `Failed to create merchant: ${details}` : "Failed to create merchant");
      }

      const data = await response.json();
      toast.success("Merchant created successfully");
      router.push(`/admin/merchant/${data.id}`);
    } catch (error: any) {
      console.error("Error creating merchant:", error);
      toast.error(error?.message || "Failed to create merchant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Two Column Vertical Form</h1>
          <p className="text-gray-600">Personal Details</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter merchant name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone:</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Enter description"
                ></textarea>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end mt-8 gap-4 col-span-1 md:col-span-2">
              <Link
                href="/admin/merchant"
                className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-orange-500 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Creating..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}