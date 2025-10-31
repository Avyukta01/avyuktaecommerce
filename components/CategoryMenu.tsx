"use client";
import React from "react";
import Image from "next/image";
import { categoryMenuList } from "@/lib/utils";
import Heading from "./Heading";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const CategoryMenu = () => {
  return (
    <section className="py-16 bg-[#F8FAFC]">
      {/* Section Heading */}
      <div className="text-black">
  <Heading title="Browse Categories" />
</div>


      {/* Category Slider */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10">
        <Swiper
          slidesPerView={6}
          spaceBetween={20}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            320: { slidesPerView: 2 },
            480: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          modules={[Autoplay]}
          className="py-8"
        >
          {categoryMenuList.map((item) => (
            <SwiperSlide key={item.id}>
  <div className="group flex flex-col items-center bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg p-6 transition-all duration-500 hover:-translate-y-3 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50">
    {/* Image Container */}
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-100 via-indigo-50 to-blue-50 flex items-center justify-center mb-4 shadow-inner border border-blue-200 group-hover:scale-105 transition-transform duration-300">
      <Image
        src={item.src}
        width={60}
        height={60}
        alt={item.title}
        className="object-contain transition-transform duration-300 group-hover:scale-110"
      />
    </div>
    {/* Category Title */}
    <h3 className="text-center text-gray-900 font-semibold text-base md:text-lg tracking-wide group-hover:text-blue-700 transition-colors duration-300">
      {item.title}
    </h3>
  </div>
</SwiperSlide>

          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CategoryMenu;
