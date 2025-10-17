"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import HeaderTop from "./HeaderTop";
import Image from "next/image";
import SearchInput from "./SearchInput";
import Link from "next/link";
import { FaBell } from "react-icons/fa6";

import CartElement from "./CartElement";
import NotificationBell from "./NotificationBell";
import HeartElement from "./HeartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";

// Material UI imports
import { AppBar, Toolbar, IconButton, Badge, Avatar, Box, Menu, MenuItem, Tooltip, Container, Paper } from "@mui/material";
import { Search, Favorite, ShoppingCart, Notifications } from "@mui/icons-material";

const Header = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { wishlist, setWishlist, wishQuantity } = useWishlistStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  };

  // getting all wishlist items by user id
  const getWishlistByUserId = async (id: string) => {
    const response = await apiClient.get(`/api/wishlist/${id}`, { cache: "no-store" });
    const wishlist = await response.json();
    const productArray: {
      id: string;
      title: string;
      price: number;
      image: string;
      slug:string
      stockAvailabillity: number;
    }[] = [];
    
    wishlist.map((item: any) => productArray.push({id: item?.product?.id, title: item?.product?.title, price: item?.product?.price, image: item?.product?.mainImage, slug: item?.product?.slug, stockAvailabillity: item?.product?.inStock}));
    
    setWishlist(productArray);
  };

  // getting user by email so I can get his user id
  const getUserByEmail = async () => {
    if (session?.user?.email) {
      apiClient.get(`/api/users/email/${session?.user?.email}`, { cache: "no-store" })
        .then((response) => response.json())
        .then((data) => {
          getWishlistByUserId(data?.id);
        });
    }
  };

  useEffect(() => {
    getUserByEmail();
  }, [session?.user?.email, wishlist.length]);

  return (
    <header>
      {/* Only show HeaderTop for website, not admin */}
      {pathname.startsWith("/admin") === false && <HeaderTop />}

      {/* Material UI AppBar for modern design */}
      <AppBar position="static" sx={{ bgcolor: "white", boxShadow: 2 }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
            
            {/* Logo */}
            <Link href="/">
              {pathname.startsWith("/admin") ? (
                <Image src="/logo_new.png" width={130} height={130} alt="singitronic logo" className="w-56 h-auto" />
              ) : (
                <Image src="/logo_new.png" width={300} height={300} alt="singitronic logo" className="relative right-5 max-[1023px]:w-56" />
              )}
            </Link>

            {/* Website Header Content */}
            {pathname.startsWith("/admin") === false && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                {/* Search */}
                <Paper sx={{ display: "flex", alignItems: "center", px: 1, py: 0.3, borderRadius: 2, minWidth: { xs: "200px", md: "400px" }}} elevation={2}>
                  <SearchInput />
                </Paper>

                {/* Icons */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <NotificationBell />
                  <HeartElement wishQuantity={wishQuantity} />
                  <CartElement />
                </Box>
              </Box>
            )}

            {/* Admin Header Content */}
            {pathname.startsWith("/admin") && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <NotificationBell />
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="w-10">
                    <Image
                      src="/randomuser.jpg"
                      alt="random profile photo"
                      width={30}
                      height={30}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <Link href="/admin">Dashboard</Link>
                    </li>
                    <li>
                      <a>Profile</a>
                    </li>
                    <li onClick={handleLogout}>
                      <a href="#">Logout</a>
                    </li>
                  </ul>
                </div>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </header>
  );
};

export default Header;
