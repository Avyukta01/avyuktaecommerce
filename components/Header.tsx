"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import SearchInput from "./SearchInput";
import Link from "next/link";
import CartElement from "./CartElement";
import NotificationBell from "./NotificationBell";
import HeartElement from "./HeartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";

import { FaUser } from "react-icons/fa6";

const Header = () => {

const [showDropdown, setShowDropdown] = useState(false);




  const { data: session } = useSession();
  const pathname = usePathname();
  const { wishQuantity, setWishlist } = useWishlistStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);



  // Fetch wishlist
  const getWishlistByUserId = async (id: string) => {
    const response = await apiClient.get(`/api/wishlist/${id}`, {
      cache: "no-store",
    });
    const wishlist = await response.json();
    const productArray = wishlist.map((item: any) => ({
      id: item?.product?.id,
      title: item?.product?.title,
      price: item?.product?.price,
      image: item?.product?.mainImage,
      slug: item?.product?.slug,
      stockAvailabillity: item?.product?.inStock,
    }));

    setWishlist(productArray);
  };

  const getUserByEmail = async () => {
    if (session?.user?.email) {

      apiClient
        .get(`/api/users/email/${session?.user?.email}`, { cache: "no-store" })

        .then((response) => response.json())
        .then((data) => {
          getWishlistByUserId(data?.id);
        });
    }
  };

  useEffect(() => {
    getUserByEmail();
  }, [session?.user?.email]);

  return (

    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Row: Logo (left) + Search (center) + Icons/Account (right) */}
          <div className="flex items-center justify-between gap-3 py-3">
            {/* Left: Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo_new.png"
                width={200}
                height={40}
                alt="Company logo"
                className="h-auto cursor-pointer hover:opacity-90 transition-all duration-200"
              />
            </Link>

            {/* Center: Search */}
            {pathname.startsWith("/admin") === false && (
              <div className="flex-1 max-w-2xl mx-2">
                  <SearchInput />
              </div>
            )}

            {/* Right: Icons + Account */}
            <div className="flex items-center gap-3 sm:gap-4">
                  <HeartElement wishQuantity={wishQuantity} />
                  <CartElement />

              {/* Account Dropdown */}
<div className="relative">
  <button
    onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <FaUser className="text-xl text-blue-600" />
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
{session ? 'My Account' : 'Account'}                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

  {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
      {!session ? (
        <>
          <Link
            href="/login"
                          className="flex items-center px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
                          <FaUser className="mr-3" />
            Login
          </Link>
          <Link
            href="/register"
                          className="flex items-center px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
                          <FaUser className="mr-3" />
            Register
          </Link>
        </>
      ) : (
        <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{session.user?.email}</p>
                          <p className="text-xs text-gray-500">Signed in</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <FaUser className="mr-3" />
                          Profile
                        </Link>
          <button
            onClick={() => {
              setShowDropdown(false);
              toast.success("Logout successful!");
              setTimeout(() => signOut(), 1000);
            }}
                          className="flex items-center w-full text-left px-4 py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
          >
                          <FaUser className="mr-3" />
            Logout
          </button>
        </>
      )}
    </div>
  )}
</div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
