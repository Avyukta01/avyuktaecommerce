"use client";
import React from "react";
import Image from "next/image";

// ✅ Import images directly (instead of string paths)
import promo1 from "@/public/smart phone 3.png";
import promo2 from "@/public/camera 3.png";
import promo3 from "@/public/camera 2.png";

interface Banner {
  title: string;
  subtitle?: string;
  description: string;
  discount?: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  imageSrc: any; // now using imported image type
  imageWidth: number;
  imageHeight: number;
  textAlign?: "left" | "right";
}

const banners: Banner[] = [
  {
    title: "Apple iPhone 14 Plus",
    description:
      "iPhone 14 has the same superspeedy chip that’s in iPhone 13 Pro, A15 Bionic, with a 5-core GPU, powers all the latest features.",
    discount: "UP TO 30% OFF",
    ctaText: "Buy Now",
    ctaLink: "#",
    bgColor: "#F5F5F7",
    imageSrc: promo1,
    imageWidth: 274,
    imageHeight: 350,
    textAlign: "left",
  },
  {
    title: "Foldable Motorised Treadmill",
    description: "Workout At Home",
    discount: "Flat 20% off",
    ctaText: "Grab Now",
    ctaLink: "#",
    bgColor: "#DBF4F3",
    imageSrc: promo2,
    imageWidth: 241,
    imageHeight: 241,
    textAlign: "right",
  },
  {
    title: "Apple Watch Ultra",
    description:
      "The aerospace-grade titanium case strikes the perfect balance of everything.",
    discount: "Up to 40% off",
    ctaText: "Buy Now",
    ctaLink: "#",
    bgColor: "#FFECE1",
    imageSrc: promo3,
    imageWidth: 200,
    imageHeight: 200,
    textAlign: "left",
  },
];

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Large Banner */}
        <div
          className="relative z-1 overflow-hidden rounded-lg py-12 lg:py-16 xl:py-20 px-4 sm:px-7 lg:px-14 xl:px-20 mb-10"
          style={{ backgroundColor: banners[0].bgColor }}
        >
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-black mb-3">
              {banners[0].title}
            </span>

            {banners[0].discount && (
              <h2 className="font-bold text-2xl lg:text-4xl text-black mb-5">
                {banners[0].discount}
              </h2>
            )}

            <p className="text-black/80">{banners[0].description}</p>

            {/* ✅ All buttons are black now */}
            <a
              href={banners[0].ctaLink}
              className="inline-flex font-medium text-white bg-black py-3 px-10 rounded-md hover:bg-gray-800 mt-6 transition"
            >
              {banners[0].ctaText}
            </a>
          </div>

          <Image
            src={banners[0].imageSrc}
            alt="promo img"
            width={banners[0].imageWidth}
            height={banners[0].imageHeight}
            className="absolute bottom-0 right-4 lg:right-20 -z-1"
          />
        </div>

        {/* Small Banners */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {banners.slice(1).map((banner, idx) => (
            <div
              key={idx}
              className={`relative z-1 overflow-hidden rounded-lg py-10 xl:py-14 px-4 sm:px-7 xl:px-10`}
              style={{ backgroundColor: banner.bgColor }}
            >
              <Image
                src={banner.imageSrc}
                alt="promo img"
                width={banner.imageWidth}
                height={banner.imageHeight}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  banner.textAlign === "left"
                    ? "right-4 sm:right-10"
                    : "left-4 sm:left-10"
                } -z-1`}
              />

              <div
                className={
                  banner.textAlign === "left" ? "text-left" : "text-right"
                }
              >
                <span className="block text-lg text-black mb-2">
                  {banner.title}
                </span>
                <h2 className="font-bold text-xl lg:text-2xl text-black mb-2">
                  {banner.description}
                </h2>
                {banner.discount && (
                  <p className="font-semibold text-black/70 mb-3">
                    {banner.discount}
                  </p>
                )}
                <a
                  href={banner.ctaLink}
                  className="inline-flex font-medium text-white bg-black py-2.5 px-8 rounded-md hover:bg-gray-800 transition mt-5"
                >
                  {banner.ctaText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
