"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  title: string;
};

const AddInventoryPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    productId: "",
    totalStock: "",
    currentStock: "",
    reservedStock: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 🔹 Fetch products (for dropdown)
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("api/products");
        const response = await res.json();
        const data = Array.isArray(response) ? response : [];
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    })();
  }, []);

  // 🔹 Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // 🔹 Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.productId) return setMessage("⚠️ Please select a product.");
    if (Number(form.totalStock) < 0) return setMessage("Total stock cannot be negative.");

    try {
      setLoading(true);
      setMessage(null);

      const payload = {
        productId: form.productId,
        totalStock: Number(form.totalStock),
        currentStock: Number(form.currentStock),
        reservedStock: Number(form.reservedStock),
      };

      const res = await apiClient.post("/inventory", payload);

      if (res.status === 201) {
        setMessage("✅ Inventory added successfully!");
        setTimeout(() => router.push("/admin/inventory"), 1500);
      } else {
        setMessage("❌ Failed to add inventory.");
      }
    } catch (err: any) {
      console.error("Error adding inventory:", err);
      setMessage("❌ Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        ➕ Add Inventory
      </h1>

      {message && (
        <div
          className={`p-3 mb-5 rounded ${
            message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Select */}
        <div>
          <label className="block text-sm font-semibold mb-1">Product</label>
          <select
            name="productId"
            value={form.productId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Total Stock */}
        <div>
          <label className="block text-sm font-semibold mb-1">Total Stock</label>
          <input
            type="number"
            name="totalStock"
            value={form.totalStock}
            onChange={handleChange}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter total stock"
            required
          />
        </div>

        {/* Current Stock */}
        <div>
          <label className="block text-sm font-semibold mb-1">Current Stock</label>
          <input
            type="number"
            name="currentStock"
            value={form.currentStock}
            onChange={handleChange}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter current stock"
            required
          />
        </div>

        {/* Reserved Stock */}
        <div>
          <label className="block text-sm font-semibold mb-1">Reserved Stock</label>
          <input
            type="number"
            name="reservedStock"
            value={form.reservedStock}
            onChange={handleChange}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter reserved stock"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={() => router.push("/admin/inventory")}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
          >
            {loading ? "Saving..." : "Save Inventory"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventoryPage;
