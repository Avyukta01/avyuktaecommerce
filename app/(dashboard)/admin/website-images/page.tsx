"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";

const AdminWebsiteImages = () => {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    sectionType: "hero",
    title: "",
    isActive: true,
    imageFile: null,
  });

  const loadImages = async () => {
    try {
      const res = await apiClient.get("/api/admin/website-images");
      const data = await res.json();
      if (data.success) setImages(data.data);
    } catch (err) {
      toast.error("Failed to load images");
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageFile) return toast.error("Please select an image file");

    try {
      const formData = new FormData();
      formData.append("image", form.imageFile);
      formData.append("sectionType", form.sectionType);
      formData.append("title", form.title);
      formData.append("isActive", String(form.isActive));

      const res = await apiClient.post("/api/admin/website-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Image uploaded successfully");
        setForm({ sectionType: "hero", title: "", isActive: true, imageFile: null });
        loadImages();
      } else {
        toast.error(data.message || "Failed to upload");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await apiClient.delete(`/api/admin/website-images/${id}`);
      const data = await res.json();
      if (data.success) {
        toast.success("Image deleted");
        loadImages();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Error deleting image");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Website Images</h1>

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border p-4 rounded-lg shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleChange}
            className="border p-2 rounded cursor-pointer"
          />

          <select
            name="sectionType"
            value={form.sectionType}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="hero">Hero Section</option>
            <option value="middle">Middle Section</option>
            <option value="bottom">Bottom Section</option>
          </select>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Optional Title"
            className="border p-2 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Active
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload Image
          </button>
        </div>
      </form>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img: any) => (
          <div
            key={img.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white"
          >
            <img
              src={img.imageUrl}
              alt={img.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold capitalize text-gray-800">
                {img.sectionType} section
              </p>
              <p className="text-xs text-gray-500">{img.title || "No title"}</p>
              <button
                onClick={() => handleDelete(img.id)}
                className="text-red-600 text-xs mt-2 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminWebsiteImages;
