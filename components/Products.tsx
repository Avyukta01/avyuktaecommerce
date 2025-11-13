"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useProductStore } from "@/app/_zustand/store";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

const Products = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category"); // ✅ Get category from URL

  const { addToCart } = useProductStore();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch products (filtered by category if available)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ✅ Use backend API (port 3001)
        let url = `http://localhost:3001/api/products`;
        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to fetch products:", res.statusText);
          setProducts([]);
          return;
        }

        const data = await res.json();

// ✅ Frontend-only filtering (if backend doesn’t support category filter)
let filtered = Array.isArray(data) ? data : [];

if (category) {
  filtered = filtered.filter(
    (p) =>
      p.category?.name?.toLowerCase() === category.toLowerCase() ||
      p.category?.slug?.toLowerCase() === category.toLowerCase()
  );
}

setProducts(filtered);

      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // 🛒 Add to Cart
  const handleAddToCart = (product: any) => {
    const cartItem = {
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      amount: 1,
    };
    addToCart(cartItem);
    toast.success("Product added to cart!");
  };

  // ❤️ Wishlist toggle
  const handleWishlistToggle = (product: any) => {
    const isWishlisted = wishlist.some((item) => item.id === product.id);
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      const wishlistItem = {
        id: product.id,
        title: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug || "",
        stockAvailabillity: 1,
      };
      addToWishlist(wishlistItem);
      toast.success("Added to wishlist");
    }
  };

  // 💳 Buy Now → checkout redirect
  const handleBuyNow = (product: any) => {
    const productData = encodeURIComponent(JSON.stringify(product));
    router.push(`/checkout?product=${productData}`);
  };

  // 🧩 UI Rendering
  if (loading) {
    return (
      <p className="text-gray-500 text-center mt-10">Loading products...</p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-gray-400 text-center mt-10">
        No products found{category ? ` in ${category}` : ""}.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-8 max-xl:grid-cols-2 max-md:grid-cols-1 ml-4">
      {products.map((product) => {
        const isWishlisted = wishlist.some((w) => w.id === product.id);

        return (
          <div
            key={product.id}
            className="bg-white border border-blue-100 rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1 group relative"
          >
            {/* ❤️ Wishlist Button */}
            <button
              onClick={() => handleWishlistToggle(product)}
              className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:bg-red-500 hover:text-white"
              }`}
              title={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                size={16}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>

            {/* 🖼️ Image */}
            <div className="h-60 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
             <img
  src={
               product.mainImage
                 ? `/${product.mainImage}`
                 : "/product_placeholder.jpg"
             }
             width={180}
             height={180}
             className="object-contain transition-transform duration-300 group-hover:scale-105"
             alt= { "Product image"}
           />

            </div>
           
            {/* 📋 Info */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="text-xl font-bold text-blue-600">
                  ₹{product.price?.toLocaleString("en-IN")}
                </p>
                <p className="text-yellow-500 font-medium text-sm">
                  ⭐ {product.rating || 4}
                </p>
              </div>

              {/* 🛒 Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} /> Add
                </button>
               <button
  onClick={() => router.push(`/product/${product.slug}`)}
  className="flex-1 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
>
  View
</button>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Products;
