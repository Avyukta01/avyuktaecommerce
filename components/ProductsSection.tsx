// *********************
// Role of the component: products section intended to be on the home page
// Name of the component: ProductsSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.2 (UI updated, responsive card layout)
// Component call: <ProductsSection />
// Input parameters: no input parameters
// Output: products grid
// *********************

"use client";

import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import Heading from "./Heading";
import apiClient from "@/lib/api";

const ProductsSection = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiClient.get("/api/products");
        if (!data.ok) {
          console.error("Failed to fetch products:", data.statusText);
          setProducts([]);
        } else {
          const result = await data.json();
          setProducts(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback mock data
        setProducts([
          {
            id: "1",
            title: "Smart Phone",
            price: 29999,
            rating: 5,
            description: "Latest smartphone with advanced features",
            mainImage: "product1.webp",
            slug: "smart-phone-demo",
            manufacturer: "Samsung",
            categoryId: "smart-phones",
            inStock: 1,
            category: { name: "Smart Phones" }
          },
          {
            id: "2",
            title: "Wireless Headphones",
            price: 15999,
            rating: 4,
            description: "High-quality wireless headphones with noise cancellation",
            mainImage: "product2.webp",
            slug: "wireless-headphones-demo",
            manufacturer: "Sony",
            categoryId: "headphones",
            inStock: 1,
            category: { name: "Headphones" }
          },
          {
            id: "3",
            title: "Smart Watch",
            price: 24999,
            rating: 5,
            description: "Advanced smartwatch with health monitoring",
            mainImage: "product3.webp",
            slug: "smart-watch-demo",
            manufacturer: "Apple",
            categoryId: "watches",
            inStock: 0,
            category: { name: "Watches" }
          },
          {
            id: "4",
            title: "Gaming Laptop",
            price: 89999,
            rating: 4,
            description: "High-performance gaming laptop with RTX graphics",
            mainImage: "product4.webp",
            slug: "gaming-laptop-demo",
            manufacturer: "ASUS",
            categoryId: "laptops",
            inStock: 1,
            category: { name: "Laptops" }
          }
        ]);
      }
    };

    fetchProducts();
  }, []); // 👈 runs once only

  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto py-16 px-5">
        <Heading title="FEATURED PRODUCTS" />

        <div className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto py-10 gap-x-2 px-10 gap-y-8 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
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
