"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import { FaPlus, FaUpload, FaSave, FaArrowLeft, FaImage, FaTag, FaStore, FaBox, FaDollarSign, FaCog } from "react-icons/fa";

interface Product {
  merchantId: string;

    title: string;
    price: number;
    manufacturer: string;
    inStock: number;
    mainImage: string;
    description: string;
    slug: string;
    categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

interface Merchant {
  id: string;
  name: string;
  email?: string;
  status?: string;
}

const AddNewProduct = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState<Product>({

    merchantId: "",
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  const [imagePreview, setImagePreview] = useState<string>("");

  const addProduct = async () => {
    if (!product.merchantId || !product.title || !product.manufacturer || !product.description || !product.slug) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const sanitizedProduct = sanitizeFormData(product);
      const response = await apiClient.post(`/api/products`, sanitizedProduct);

      if (response.status === 201) {

        toast.success("Product added successfully!");
        router.push("/admin/products");

      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMerchants = async () => {
    try {
      const res = await apiClient.get("/api/merchants");
      const data: Merchant[] = await res.json();
      setMerchants(Array.isArray(data) ? data : []);
      if (data && data.length > 0) {
        setProduct(prev => ({ ...prev, merchantId: prev.merchantId || data[0].id }));
      }
    } catch (e) {
      toast.error("Failed to load merchants");
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {

      const response = await apiClient.post("/api/main-image", formData);


      if (!response.ok) {
        toast.error("File upload failed");
        return;
      }
      
      const data = await response.json();
      setProduct(prev => ({ ...prev, mainImage: data.filename || file.name }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  const fetchCategories = async () => {

    try {
      const res = await apiClient.get(`/api/categories`);
      const data: Category[] = await res.json();
      setCategories(Array.isArray(data) ? data : []);
      if (data && data.length > 0) {
        setProduct(prev => ({ ...prev, categoryId: prev.categoryId || data[0].id }));
      }
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      uploadFile(file);
    }

  };

  useEffect(() => {
    fetchCategories();
    fetchMerchants();
  }, []);

  return (
    <AdminLayout 
      title="Add New Product" 
      
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaBox className="text-blue-600" />
                    Basic Information
                  </h3>
                  
                  {/* Product Name */}
        <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *

          </label>
                    <input
                      type="text"
                      value={product.title}
                      onChange={(e) => setProduct({ ...product, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter product name"
                    />
        </div>

                  {/* Product Slug */}
        <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Slug *
                    </label>

            <input
              type="text"
                      value={convertSlugToURLFriendly(product.slug)}
                      onChange={(e) => setProduct({ ...product, slug: convertSlugToURLFriendly(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="product-slug"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={product.description}
                      onChange={(e) => setProduct({ ...product, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaDollarSign className="text-green-600" />
                    Pricing & Inventory
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹)
          </label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0"
                      />
        </div>

        <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity
                      </label>
            <input
                        type="number"
                        value={product.inStock}
                        onChange={(e) => setProduct({ ...product, inStock: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0"
                      />
                    </div>
        </div>

        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={product.manufacturer}
                      onChange={(e) => setProduct({ ...product, manufacturer: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter manufacturer name"
                    />
                  </div>
                </div>
            </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Category & Merchant */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaTag className="text-purple-600" />
                    Category & Merchant
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
            <select
                      value={product.categoryId}
                      onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                  </option>
                ))}
            </select>
        </div>

        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merchant *
          </label>
                    <select
                      value={product.merchantId}
                      onChange={(e) => setProduct({ ...product, merchantId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a merchant</option>
                      {merchants.map((merchant) => (
                        <option key={merchant.id} value={merchant.id}>
                          {merchant.name}
                        </option>
                      ))}
                    </select>
                    {merchants.length === 0 && (
                      <p className="text-sm text-red-500 mt-2">
                        No merchants available. Please create a merchant first.
                      </p>
                    )}
        </div>
            </div>

                {/* Product Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaImage className="text-orange-600" />
                    Product Image
                  </h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <FaUpload className="text-white" size={24} />
                          </div>
        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <FaUpload size={32} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {uploading ? "Uploading..." : "Click to upload image"}
                          </span>
            </div>
                      )}
          </label>
        </div>
        </div>
            </div>
        </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-200 mt-8">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
          <button
            onClick={addProduct}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave size={16} />
                    Create Product
                  </>
                )}
          </button>
        </div>
      </div>
    </div>
      </div>
    </AdminLayout>
  );
};

export default AddNewProduct;
