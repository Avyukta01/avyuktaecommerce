"use client";
import React from "react";
import { MdDashboard } from "react-icons/md";
import { FaTable } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";
import { FaBagShopping } from "react-icons/fa6";
import { FaStore } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";


import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const DashboardSidebar = () => {
  const [isImageLoading, setIsImageLoading] = React.useState<boolean>(true);
  const [hasImageError, setHasImageError] = React.useState<boolean>(false);

  const pathname = usePathname();
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setHasImageError(true);
  };

  React.useEffect(() => {
    const img = new window.Image();
    img.src = "/avyukta_logo_new.png"; // <-- fixed path
    img.onload = handleImageLoad;
    img.onerror = handleImageError;
  }, []);

  return (

    <div
      className="xl:w-[260px] max-xl:w-full h-screen fixed top-0 left-0 bg-white shadow-lg border-r border-slate-200 transition-all duration-300 flex flex-col justify-between overflow-y-auto z-50"
    >
      {/* Modern Sidebar Header */}
<div className="p-6 border-b border-slate-200 sticky top-0 z-10 bg-white flex items-center justify-center">
  {isImageLoading && (
    <div className="w-full h-16 bg-gray-300 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-3/4 h-10 bg-gray-400 rounded" />
    </div>
  )}

  {!isImageLoading && !hasImageError && (
    <img
      src="/avyukta_logo_new.png"
      alt="logo"
      className="h-10 w-auto object-contain transition-opacity duration-300"
    />
  )}

  {hasImageError && (
    <div className="text-red-500 text-sm">Logo failed to load</div>
  )}
</div>


      {/* Modern Navigation Links */}
      <div className="flex flex-col flex-1 px-4 py-2">
        <Link href="/admin">
          <div className={`flex gap-x-3 w-full cursor-pointer items-center py-3 px-3 text-sm font-medium transition-all duration-200 group relative rounded-lg mb-1 ${
           pathname === "/admin"
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <MdDashboard className={`text-lg transition-colors ${
              pathname === "/admin"
                ? "text-white" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            <span>Dashboard</span>
          </div>
        </Link>

        <Link href="/admin/orders">
          <div className={`flex gap-x-3 w-full cursor-pointer items-center py-3 px-3 text-sm font-medium transition-all duration-200 group relative rounded-lg mb-1 ${
            pathname === "/admin/orders" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <FaBagShopping className={`text-lg transition-colors ${
              pathname === "/admin/orders" 
                ? "text-white" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            <span>Orders</span>
          </div>
        </Link>

        <Link href="/admin/products">
          <div className={`flex gap-x-3 w-full cursor-pointer items-center py-3 px-3 text-sm font-medium transition-all duration-200 group relative rounded-lg mb-1 ${
            pathname === "/admin/products" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <FaTable className={`text-lg transition-colors ${
              pathname === "/admin/products" 
                ? "text-white" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            <span>Products</span>
          </div>
        </Link>

        <Link href="/admin/bulk-upload">
          <div className={`flex gap-x-3 w-full cursor-pointer items-center py-3 px-3 text-sm font-medium transition-all duration-200 group relative rounded-lg mb-1 ${
            pathname === "/admin/bulk-upload" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <FaFileUpload className={`text-lg transition-colors ${
              pathname === "/admin/bulk-upload" 
                ? "text-white" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            <span>Bulk Upload</span>
          </div>
        </Link>

        <Link href="/admin/categories">
          <div className={`flex gap-x-3 w-full cursor-pointer items-center py-3 px-3 text-sm font-medium transition-all duration-200 group relative rounded-lg mb-1 ${
            pathname === "/admin/categories" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <MdCategory className={`text-lg transition-colors ${
              pathname === "/admin/categories" 
                ? "text-white" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            <span>Categories</span>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className={`flex gap-x-3 w-full cursor-pointer items-center py-3 px-3 text-sm font-medium transition-all duration-200 group relative rounded-lg mb-1 ${
            pathname === "/admin/users" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <FaRegUser className={`text-lg transition-colors ${
              pathname === "/admin/users" 
                ? "text-white" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            <span>Users</span>
          </div>
        </Link>

        <Link href="/admin/merchant">
          <div className={`flex gap-x-3 w-full cursor-pointer items-center py-3 px-3 text-sm font-medium transition-all duration-200 group relative rounded-lg mb-1 ${
            pathname === "/admin/merchant" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <FaStore className={`text-lg transition-colors ${
              pathname === "/admin/merchant" 
                ? "text-white" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            <span>Merchant</span>
          </div>
        </Link>

        {/* <Link href="/admin/settings">
          <div className={`flex gap-x-3 w-full cursor-pointer items-center py-3 px-3 text-sm font-medium transition-all duration-200 group relative rounded-lg mb-1 ${
            pathname === "/admin/settings" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <FaGear className={`text-lg transition-colors ${
              pathname === "/admin/settings" 
                ? "text-white" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            <span>Settings</span>
          </div>
        </Link> */}
      </div>

      {/* Modern Footer */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
            </svg>
            <span>Get Help</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <FaGear className="text-sm" />
            <span>Settings</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 text-center text-xs text-gray-500">
          © 2026 Avyukta Admin
        </div>
      </div>

    </div>
  );
};

export default DashboardSidebar;
