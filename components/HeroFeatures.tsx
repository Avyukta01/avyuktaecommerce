"use client";

import React from "react";
import Image from "next/image";

// Import images
import Icon01 from "../image/3af96421a4b69c287b8ffef379a11ab170d7449d-758x521.webp";
import Icon02 from "../image/3af96421a4b69c287b8ffef379a11ab170d7449d-758x521.webp";
import Icon03 from "../image/3af96421a4b69c287b8ffef379a11ab170d7449d-758x521.webp";
import Icon04 from "../image/3af96421a4b69c287b8ffef379a11ab170d7449d-758x521.webp";

// Feature data
const featureData = [
  { img: Icon01, title: "Free Shipping", description: "For all orders $200" },
  { img: Icon02, title: "1 & 1 Returns", description: "Cancellation after 1 day" },
  { img: Icon03, title: "100% Secure Payments", description: "Guarantee secure payments" },
  { img: Icon04, title: "24/7 Dedicated Support", description: "Anywhere & anytime" },
];

const HeroFeature: React.FC = () => {
  return (
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="flex flex-wrap items-center gap-10 mt-10">
        {featureData.map((item, key) => (
          <div className="flex items-center gap-4" key={key}>
            <Image src={item.img} alt={item.title} width={40} height={41} />

            <div>
              <h3 className="font-medium text-lg text-dark">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
