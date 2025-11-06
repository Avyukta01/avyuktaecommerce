"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdOutlineAddCircleOutline } from "react-icons/md";

interface GenericTerm {
  id: string;
  key: string;
  value: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const GenericTermsPage = () => {
  const [terms, setTerms] = useState<GenericTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    key: "",
    value: "",
    isActive: true,
  });

  // Load all terms
  const loadTerms = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/admin/generic-terms");
      const data = await res.json();
      if (data.success) setTerms(data.data || []);
      else toast.error("Failed to fetch terms");
    } catch (err) {
      toast.error("Error fetching terms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, []);

  // Handle input
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Reset
  const resetForm = () => {
    setForm({ key: "", value: "", isActive: true });
    setEditingId(null);
  };

  // Submit (Add / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.value.trim()) {
      toast.error("Key and value are required");
      return;
    }

    try {
      if (editingId) {
 const res = await apiClient.put(`/api/admin/generic-terms/${editingId}`, form);

        const data = await res.json();
        if (data.success) toast.success("Term updated successfully");
        else toast.error(data.message || "Update failed");
      } else {
        const res = await apiClient.post("/api/admin/generic-terms", form);
        const data = await res.json();
        if (data.success) toast.success("Term added successfully");
        else toast.error(data.message || "Failed to create term");
      }
      resetForm();
      loadTerms();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  // Edit
  const handleEdit = (term: GenericTerm) => {
    setForm({
      key: term.key,
      value: term.value,
      isActive: term.isActive,
    });
    setEditingId(term.id);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this term?")) return;
    try {
      const res = await apiClient.delete(`/api/admin/generic-terms/${id}`);
      const data = await res.json();
      if (data.success) {
        toast.success("Term deleted");
        loadTerms();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting term");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Generic Terms Management
        </h1>
      </div>

      {/* Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm border border-gray-200 rounded-xl p-5 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key
            </label>
            <input
              name="key"
              value={form.key}
              onChange={handleChange}
              placeholder="Enter key name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="Enter description/value"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            Active
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <MdOutlineAddCircleOutline size={18} />
              {editingId ? "Update Term" : "Add Term"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Terms Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Key</th>
              <th className="text-left px-4 py-3 font-medium">Value</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Loading terms...
                </td>
              </tr>
            ) : terms.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No terms found
                </td>
              </tr>
            ) : (
              terms.map((term) => (
                <tr
                  key={term.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {term.key}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{term.value}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        term.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {term.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(term)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(term.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenericTermsPage;
