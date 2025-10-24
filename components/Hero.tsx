"use client";
import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <section className="relative w-full bg-[#F8FAFC] overflow-hidden py-20 px-6 sm:px-10">
      {/* Background subtle glows */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gray-200 blur-[120px] rounded-full opacity-40"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-gray-300 blur-[120px] rounded-full opacity-40"></div>

      {/* Main Container */}
      <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 z-10">
        {/* Left: Text Section */}
        <div className="flex flex-col gap-6 text-left max-lg:text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
            Smart Choices, Better Living
          </h1>

          <p className="text-gray-600 text-lg sm:text-base leading-relaxed  mx-auto max-lg:mx-auto">
            Discover trending products curated just for you. Shop smarter and enjoy exclusive deals
            on electronics, lifestyle, and fashion — all in one place.
          </p>

          {/* Dynamic product info placeholder */}
          <div className="bg-white rounded-2xl shadow-md p-6 mt-2 w-full sm:w-[100%] mx-auto border border-gray-100" >
            <div className="flex items-center justify-between gap-6 max-sm:flex-col" >
              {/* Image placeholder */}
              <div className="w-[120px] h-[120px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">
                Image
              </div>

              {/* Product info placeholder */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Product Name
                </h3>
                <p className="text-gray-500 mb-3 text-sm">
                  Short product description goes here.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-500">$699</span>
                  <span className="text-gray-400 line-through">$999</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6 max-lg:justify-center max-sm:flex-col">
            <button className="bg-gray-900 text-white font-semibold px-10 py-3 rounded-xl shadow-md hover:bg-gray-800 transition-all duration-300">
              Shop Now
            </button>
            <button className="border border-gray-900 text-gray-900 font-semibold px-10 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300">
              View Offers
            </button>
          </div>
        </div>

        {/* Right: Image Section */}
        <div className="flex justify-center relative" style={{marginBottom:"100px"}}>
          {/* Soft glow behind product */}
          <div className="absolute w-[350px] h-[350px] bg-gray-200 rounded-full blur-3xl animate-pulse"></div>

          {/* Dynamic image placeholder */}
          <div className="relative z-10 w-[400px] h-[400px] bg-white border border-gray-100 rounded-2xl shadow-lg flex items-center justify-center text-gray-400 font-medium max-md:w-[300px] max-md:h-[300px]">
            Product Image
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
