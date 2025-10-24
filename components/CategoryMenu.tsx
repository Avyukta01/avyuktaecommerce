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
  <Heading title="BROWSE CATEGORIES" />
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
              <div className="group flex flex-col items-center bg-white rounded-2xl shadow-md p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                {/* Image Container */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center mb-3 border border-blue-200">
                  <Image
                    src={item.src}
                    width={56}
                    height={56}
                    alt={item.title}
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                {/* Category Title */}
                <h3 className="text-center text-black font-semibold text-sm md:text-base">
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
