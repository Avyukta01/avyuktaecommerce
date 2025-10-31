"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import apiClient from "@/lib/api"; // ADD: use your apiClient
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import { FaPlus, FaUpload, FaSave, FaArrowLeft, FaImage, FaTag, FaStore, FaBox, FaDollarSign, FaCog, FaVideo, FaTrash, FaStar } from "react-icons/fa";

interface Product {
  merchantId: string;
  title: string;
  price: number;
  manufacturer: string;
  inStock: number;
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

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
  isMain?: boolean;
}

// ADD: Drag & Drop Upload Component (unchanged)
const MediaUploader: React.FC<{
  files: MediaFile[];
  setFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>;
  uploading: boolean;
}> = ({ files, setFiles, uploading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: MediaFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          preview: URL.createObjectURL(file),
          type: file.type.startsWith("image/") ? "image" : "video",
        });
      }
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    URL.revokeObjectURL(files.find(f => f.id === id)?.preview || "");
  };

  const setAsMain = (id: string) => {
    setFiles(prev => prev.map(f => ({
      ...f,
      isMain: f.id === id
    })));
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="media-upload"
          disabled={uploading}
        />
        <label htmlFor="media-upload" className="cursor-pointer">
          <FaUpload size={40} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Drop images & videos here
          </p>
          <p className="text-sm text-gray-500 mt-1">
            or click to browse (up to 20 files)
          </p>
        </label>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((media) => (
            <div
              key={media.id}
              className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
            >
              {media.type === "image" ? (
                <img
                  src={media.preview}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
              ) : (
                <video
                  src={media.preview}
                  className="w-full h-40 object-cover"
                  controls
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                  <button
                    onClick={() => setAsMain(media.id)}
                    className={`p-2 rounded-lg ${
                      media.isMain
                        ? "bg-yellow-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                    title="Set as main"
                  >
                    <FaStar size={14} />
                  </button>
                  <button
                    onClick={() => removeFile(media.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              {/* Main Badge */}
              {media.isMain && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-bold rounded">
                  MAIN
                </div>
              )}

              {/* Type Icon */}
              <div className="absolute bottom-2 right-2">
                {media.type === "image" ? (
                  <FaImage className="text-white drop-shadow" />
                ) : (
                  <FaVideo className="text-white drop-shadow" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
    description: "",
    slug: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  
  // ADD: Media files state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // ADD: Auto-generate slug from title
  useEffect(() => {
    if (product.title) {
      const slug = product.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setProduct(prev => ({ ...prev, slug }));
    }
  }, [product.title]);

  // FIXED: Ensure at least one image is set as main
  useEffect(() => {
    if (mediaFiles.length > 0 && !mediaFiles.some(f => f.isMain)) {
      setMediaFiles(prev => prev.map((f, i) => ({ ...f, isMain: i === 0 })));
    }
  }, [mediaFiles]);

  // FIXED: Corrected addProduct function (only change: removed headers)
  const addProduct = async () => {
    if (!product.merchantId || !product.title || !product.description || mediaFiles.length === 0) {
      toast.error("Please fill all required fields and upload at least one image");
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      const formData = new FormData();
      
      // Append product data
      formData.append("merchantId", product.merchantId);
      formData.append("title", product.title);
      formData.append("price", product.price.toString());
      formData.append("description", product.description);
      formData.append("manufacturer", product.manufacturer || "");
      formData.append("inStock", product.inStock.toString());
      formData.append("slug", product.slug);
      formData.append("categoryId", product.categoryId);

      // Append all media files under "media" field
      mediaFiles.forEach((media, index) => {
        formData.append("media", media.file);
        if (media.isMain) {
          formData.append("mainImageIndex", index.toString());
        }
      });

      // FIXED: No headers → Let browser set boundary automatically
      const response = await apiClient.post("/api/products", formData);
      // const response = await apiClient.post("/api/products", formData);

      toast.success("Product created successfully!");
      router.push("/admin/products");

    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setLoading(false);
      setUploading(false);
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

  useEffect(() => {
    fetchCategories();
    fetchMerchants();
  }, []);

  return (
    <AdminLayout title="Add New Product">
      <div className="max-w-6xl mx-auto">
       
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Info */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        value={product.title}
                        onChange={(e) => setProduct({ ...product, title: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Awesome Product"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                      <input
                        type="text"
                        value={product.slug}
                        readOnly
                        className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={product.description}
                      onChange={(e) => setProduct({ ...product, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your product..."
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    Pricing & Stock
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={product.inStock}
                        onChange={(e) => setProduct({ ...product, inStock: Number(e.target.value) })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                      <input
                        type="text"
                        value={product.manufacturer}
                        onChange={(e) => setProduct({ ...product, manufacturer: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Upload */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    Media Upload *
                  </h3>
                  <MediaUploader
                    files={mediaFiles}
                    setFiles={setMediaFiles}
                    uploading={uploading}
                  />
                  {mediaFiles.length > 0 && !mediaFiles.some(f => f.isMain) && (
                    <p className="text-sm text-amber-600 mt-2">
                      Warning: Click the star icon to set a main image
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Sidebar */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Category & Merchant
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={product.categoryId}
                        onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Merchant *</label>
                      <select
                        value={product.merchantId}
                        onChange={(e) => setProduct({ ...product, merchantId: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select merchant</option>
                        {merchants.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• First image = main image (or click star)</li>
                    <li>• Supports JPG, PNG, WebP, MP4</li>
                    <li>• Max 20 files</li>
                    <li>• Videos auto-get thumbnails</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 mt-8 pt-8 border-t">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addProduct}
                disabled={loading || uploading || mediaFiles.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
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