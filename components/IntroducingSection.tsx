"use client";
import React from "react";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";

// Use only images that exist in /public to avoid 404s
const products = [
  {
    id: 1,
    name: "Smart Watch",
    price: "₹2,499",
    image: "/watch for banner.png",
  },
  {
    id: 2,
    name: "Wireless Earbuds",
    price: "₹1,799",
    image: "/earbuds 1.png",
  },
  {
    id: 3,
    name: "Gaming Headset",
    price: "₹3,299",
    image: "/headphones 1.png",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: "₹2,099",
    image: "/sony speaker image.png",
  },
  {
    id: 5,
    name: "Smartphone",
    price: "₹19,999",
    image: "/smart phone 1.png",
  },
  {
    id: 6,
    name: "Laptop",
    price: "₹49,999",
    image: "/laptop 1.webp",
  },
  {
    id: 7,
    name: "Smart LED TV",
    price: "₹25,999",
    image: "/tv.jpg",
  },
  {
    id: 8,
    name: "Tablet",
    price: "₹12,499",
    image: "/tablet 1 1.png",
  },
];

const IntroducingSection = () => {
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
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Image */}
            <div className="relative w-full h-40 sm:h-44 flex items-center justify-center overflow-hidden bg-gray-50">
              <Image
                src={product.image}
                alt={product.name}
                width={160}
                height={160}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                {product.name}
              </h3>
              <p className="text-blue-600 text-lg font-bold mb-3">
                {product.price}
              </p>

              {/* Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors duration-200">
                  <ShoppingCart size={14} /> 
                  <span className="hidden sm:inline">Add</span>
                </button>
                <button className="p-2 rounded-md border border-gray-300 hover:bg-pink-50 transition-colors duration-200">
                  <Heart size={16} className="text-pink-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default IntroducingSection;
