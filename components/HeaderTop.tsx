// *********************
// Role of the component: Topbar of the header
// Name of the component: HeaderTop.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <HeaderTop />
// Input parameters: no input parameters
// Output: topbar with phone, email and login and register links
// *********************

"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
import { FaHeadphones } from "react-icons/fa6";
import { FaRegEnvelope } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";

const HeaderTop = () => {
  const { data: session }: any = useSession();

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  }
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-2 lg:gap-4">
          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <FaHeadphones className="text-blue-200 text-sm" />
              <span className="font-medium">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaRegEnvelope className="text-blue-200 text-sm" />
              <span className="font-medium hidden sm:inline">support@company.com</span>
              <span className="font-medium sm:hidden">support@company.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaLocationDot className="text-blue-200 text-sm" />
              <span className="font-medium">Delhi, India</span>
            </div>
          </div>

          {/* Auth Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!session ? (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors duration-200 text-xs sm:text-sm font-medium"
                >
                  <FaRegUser className="text-blue-200 text-sm" />
                  <span>Login</span>
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors duration-200 text-xs sm:text-sm font-medium"
                >
                  <FaRegUser className="text-blue-200 text-sm" />
                  <span>Register</span>
                </Link>
              </>
            ) : (
              <>
                <span className="text-xs sm:text-sm font-medium text-blue-100 hidden sm:inline">
                  Welcome, {session.user?.email?.split('@')[0]}
                </span>
                <span className="text-xs font-medium text-blue-100 sm:hidden">
                  Welcome
                </span>
                <button 
                  onClick={() => handleLogout()} 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 transition-colors duration-200 text-xs sm:text-sm font-medium"
                >
                  <FaRegUser className="text-red-200 text-sm" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;
