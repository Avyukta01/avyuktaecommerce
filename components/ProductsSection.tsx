"use client";

import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import Heading from "./Heading";
import apiClient from "@/lib/api";

const ProductsSection = () => {
  const [products, setProducts] = useState<any[]>([]);

  // 👇 fallback static data defined once
  const fallbackProducts = [
    {
      id: "1",
      title: "Smart Phone",
      price: 29999,
      rating: 5,
      description: "Latest smartphone with advanced features",
      mainImage: "https://m.media-amazon.com/images/I/71geVdy6-OS._SL1500_.jpg",
      slug: "smart-phone-demo",
      manufacturer: "Samsung",
      categoryId: "smart-phones",
      inStock: 1,
      category: { name: "Smart Phones" },
    },
    {
      id: "2",
      title: "Wireless Headphones",
      price: 15999,
      rating: 4,
      description:
        "High-quality wireless headphones with noise cancellation",
      mainImage: "https://m.media-amazon.com/images/I/61QJ5Vq7t9L._SL1500_.jpg",
      slug: "wireless-headphones-demo",
      manufacturer: "Sony",
      categoryId: "headphones",
      inStock: 1,
      category: { name: "Headphones" },
    },
    {
      id: "3",
      title: "Smart Watch",
      price: 24999,
      rating: 5,
      description: "Advanced smartwatch with health monitoring",
      mainImage: "https://m.media-amazon.com/images/I/71I0VD6J8IL._SL1500_.jpg",
      slug: "smart-watch-demo",
      manufacturer: "Apple",
      categoryId: "watches",
      inStock: 0,
      category: { name: "Watches" },
    },
    {
      id: "4",
      title: "Gaming Laptop",
      price: 89999,
      rating: 4,
      description: "High-performance gaming laptop with RTX graphics",
      mainImage: "https://m.media-amazon.com/images/I/81fxjeu8fdL._SL1500_.jpg",
      slug: "gaming-laptop-demo",
      manufacturer: "ASUS",
      categoryId: "laptops",
      inStock: 1,
      category: { name: "Laptops" },
    },
    {
      id: "5",
      title: "Gaming Laptop",
      price: 89999,
      rating: 4,
      description: "High-performance gaming laptop with RTX graphics",
      mainImage: "https://m.media-amazon.com/images/I/81fxjeu8fdL._SL1500_.jpg",
      slug: "gaming-laptop-demo",
      manufacturer: "ASUS",
      categoryId: "laptops",
      inStock: 1,
      category: { name: "Laptops" },
    },
   
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get("/api/products");

        // ✅ If API fails or returns invalid JSON, fallback to static data
        if (!res.ok) {
          console.error("Failed to fetch products:", res.statusText);
          setProducts(fallbackProducts);
          return;
        }

        const result = await res.json();
        if (Array.isArray(result) && result.length > 0) {
          setProducts(result);
        } else {
          console.warn("No data received, using fallback products.");
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(fallbackProducts);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto py-16 px-5">
        <Heading title=" Products" />

        <div className="grid grid-cols-5 justify-items-center max-w-screen-2xl mx-auto py-10 gap-x-1 gap-y-4 px-2 max-md:grid-cols-2">
          {products.length > 0 ? (
            products.map((product: any) => (
              <div
                key={product.id}
                className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <ProductItem product={product} color="black" />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-700 py-20 text-lg font-semibold">
              No products available at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
