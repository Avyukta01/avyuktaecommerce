"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import bgImage from "@/public/custom/backgrounglandingpage.png";
import { useRouter } from "next/navigation";

type HeroData = {
  title: string;
  description?: string;
  imageUrl: string;
};

const Hero = () => {
  const router = useRouter();
  const [heroData, setHeroData] = useState<HeroData | null>(null);

  // ✅ Fetch data from backend
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/websiteimage/section/hero");
        if (!res.ok) throw new Error("Failed to fetch hero data");

        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          const hero = data.data[0];
          setHeroData({
            title: hero.title || "",
            description: hero.description || "",
            imageUrl: hero.imageUrl ? `http://localhost:3001${hero.imageUrl}` : "",
          });
        }
      } catch (error) {
        console.error("❌ Error fetching hero data:", error);
      }
    };

    fetchHeroData();
  }, []);

  // ✅ Fallback (if DB empty or error)
  const title = heroData?.title || "Smart Choices, Better Living";
  const description =
    heroData?.description ||
    "Discover trending products curated just for you. Shop smarter and enjoy exclusive deals on electronics, lifestyle, and fashion — all in one place.";
  const backgroundImage = heroData?.imageUrl || bgImage;

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        padding: "80px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* ✅ Background (Dynamic or Static) */}
      <Image
        src={backgroundImage}
        alt="Hero Background"
        fill
        priority
        style={{
          objectFit: "cover",
          objectPosition: "center",
          position: "absolute",
          inset: 0,
          zIndex: -10,
          opacity: 0.9,
          animation: "fadeIn 3s ease-in-out",
        }}
      />

      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(230,245,255,0.4))",
          zIndex: -9,
        }}
      ></div>

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1200px",
          width: "100%",
          flexWrap: "wrap",
          gap: "40px",
        }}
      >
        {/* Left Content */}
        <div
          style={{
            flex: "1 1 500px",
            color: "#111",
            animation: "slideInLeft 1.5s ease",
            textAlign: "left",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: "900",
              lineHeight: "1.2",
              marginBottom: "20px",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "#333",
              lineHeight: "1.6",
              maxWidth: "600px",
              marginBottom: "30px",
            }}
          >
            {description}
          </p>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                backgroundColor: "#111",
                color: "#fff",
                fontWeight: "600",
                padding: "14px 40px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
              onClick={() => router.push("/shop")}
            >
              Shop Now
            </button>

            <button
              style={{
                backgroundColor: "transparent",
                color: "#111",
                fontWeight: "600",
                padding: "14px 40px",
                borderRadius: "12px",
                border: "2px solid #111",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={() => router.push("/offers")}
            >
              View Offers
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(1.05);
          }
          to {
            opacity: 0.9;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
