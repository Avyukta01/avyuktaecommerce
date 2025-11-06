"use client";

import React, { useEffect, useState } from "react";
import Heading from "./Heading";
import ProductItem from "./ProductItem";
import apiClient from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const ProductsSection = () => {
  const [products, setProducts] = useState<any[]>([]);

  // 🧩 Fallback Products
  const fallbackProducts = [
    {
      id: "1",
      title: "Smart Phone",
      price: 29999,
      rating: 5,
      description: "Latest smartphone with advanced features",
      mainImage: "https://m.media-amazon.com/images/I/71geVdy6-OS._SL1500_.jpg",
      slug: "smart-phone-demo",
      categoryId: "smart-phones",
      category: { name: "Smart Phones" },
      inStock: 1,
    },
    {
      id: "2",
      title: "Wireless Headphones",
      price: 15999,
      rating: 4,
      description: "High-quality wireless headphones with noise cancellation",
      mainImage: "https://m.media-amazon.com/images/I/61QJ5Vq7t9L._SL1500_.jpg",
      slug: "wireless-headphones-demo",
      categoryId: "headphones",
      category: { name: "Headphones" },
      inStock: 1,
    },
    {
      id: "3",
      title: "Smart Watch",
      price: 24999,
      rating: 5,
      description: "Advanced smartwatch with health monitoring",
      mainImage: "https://m.media-amazon.com/images/I/71I0VD6J8IL._SL1500_.jpg",
      slug: "smart-watch-demo",
      categoryId: "watches",
      category: { name: "Watches" },
      inStock: 1,
    },
    {
      id: "4",
      title: "Gaming Laptop",
      price: 89999,
      rating: 4,
      description: "High-performance gaming laptop with RTX graphics",
      mainImage: "https://m.media-amazon.com/images/I/81fxjeu8fdL._SL1500_.jpg",
      slug: "gaming-laptop-demo",
      categoryId: "laptops",
      category: { name: "Laptops" },
      inStock: 1,
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get("/api/products");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProducts(Array.isArray(data) && data.length > 0 ? data : fallbackProducts);
      } catch (err) {
        console.error("Error:", err);
        setProducts(fallbackProducts);
      }
    };
    fetchProducts();
  }, []);

  // 🧩 Group Products by Category
  const groupedProducts = products.reduce((acc: any, product: any) => {
    const categoryName = product.category?.name || "Others";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(product);
    return acc;
  }, {});

  return (
    <section className="bg-[#F9FAFB] py-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
        {Object.entries(groupedProducts).map(([categoryName, categoryProducts]: any) => (
          <div key={categoryName} className="mb-14">
            {/* ✅ Category Title */}
            <Heading title={categoryName} />

            {/* ✅ Swiper Slider for Category */}
            <Swiper
              slidesPerView={6}
              spaceBetween={12}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              loop={true}
              breakpoints={{
                320: { slidesPerView: 2 },
                480: { slidesPerView: 2.3 },
                768: { slidesPerView: 3.3 },
                1024: { slidesPerView: 5 },
                1280: { slidesPerView: 6 },
              }}
              modules={[Autoplay]}
              className="py-6"
            >
              {categoryProducts.map((product: any) => (
                <SwiperSlide key={product.id}>
                  <div className="group bg-white border border-gray-200 rounded-xl  hover:shadow-md transition-all duration-300 overflow-hidden">
                    {/* 👇 Your Existing ProductItem (keeps Add to Cart, Wishlist, View, etc.) */}
                    <ProductItem product={product} color="black" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;
