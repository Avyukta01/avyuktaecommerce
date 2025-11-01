"use client";
import Image from "next/image";
import React from "react";
import bgImage from "@/public/custom/backgrounglandingpage.png";
import { useRouter } from "next/navigation"; // ✅ add this at the top

const Hero = () => {

  const router = useRouter(); // ✅ add this inside your component before return()

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
      {/* Background Image */}
      <Image
        src={bgImage}
        alt="Ecommerce Background"
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

      {/* Glowing Blobs */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "250px",
          height: "250px",
          background: "rgba(180,220,255,0.4)",
          borderRadius: "50%",
          filter: "blur(120px)",
          animation: "blobMove 8s infinite alternate ease-in-out",
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "300px",
          height: "300px",
          background: "rgba(200,220,255,0.5)",
          borderRadius: "50%",
          filter: "blur(120px)",
          animation: "blobMove2 10s infinite alternate ease-in-out",
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
            Smart Choices, Better Living
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
            Discover trending products curated just for you. Shop smarter and enjoy exclusive deals
            on electronics, lifestyle, and fashion — all in one place.
          </p>

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
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#333";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#111";
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
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f3f3f3";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
    }}
  >
    View Offers
  </button>
</div>

        </div>
      </div>

      {/* Inline Animations */}
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

        @keyframes blobMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(60px, -40px);
          }
        }

        @keyframes blobMove2 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-40px, 50px);
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

        @media (max-width: 768px) {
          section {
            padding: 60px 16px;
          }
          div {
            text-align: center !important;
          }
          button {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
