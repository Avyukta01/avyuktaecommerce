"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import apiClient from "@/lib/api"; // Your axios/fetch wrapper

// -----------------------------
// Type Definitions
// -----------------------------
interface Product {
  id: number | string;
  title: string;
  price: number;
  mainImage?: string;
  [key: string]: any; // extra fields from API
}

interface CartItem extends Product {
  quantity: number;
}

// -----------------------------
// Component
// -----------------------------
const IntroducingSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch products dynamically from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch products:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  return (
    <section className="py-20 bg-white relative">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-black-700 max-md:text-4xl max-sm:text-3xl">
          Popular Products
        </h2>
        <p className="text-gray-500 text-lg mt-3 max-sm:text-base">
          Discover our latest arrivals — crafted for your lifestyle.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-w-7xl mx-auto px-4 sm:px-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative w-full h-40 sm:h-44 flex items-center justify-center overflow-hidden bg-gray-50">
                <Image
                  src={
    product.mainImage
      ? product.mainImage.startsWith("http")
        ? product.mainImage
        : product.mainImage.startsWith("/")
        ? product.mainImage
        : `/${product.mainImage}`
      : "/placeholder.png"
  }
                  alt={product.title}
                  width={160}
                  height={160}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                  {product.title}
                </h3>
                <p className="text-blue-600 text-lg font-bold mb-3">
                  ₹{product.price}
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    <ShoppingCart size={14} />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                  <button className="p-2 rounded-md border border-gray-300 hover:bg-pink-50 transition-colors duration-200">
                    <Heart size={16} className="text-pink-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-700 py-20 text-lg font-semibold">
            NO products...
          </div>
        )}
      </div>
    </section>
  );
};

export default IntroducingSection;
