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
import { AppBar, Toolbar, Box, Paper, Container } from "@mui/material";

const Header = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { wishQuantity, setWishlist } = useWishlistStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  };

  const getWishlistByUserId = async (id: string) => {
    const response = await apiClient.get(`/api/wishlist/${id}`, { cache: "no-store" });
    const wishlist = await response.json();
    const productArray: {
      id: string;
      title: string;
      price: number;
      image: string;
      slug: string
      stockAvailabillity: number;
    }[] = [];

    wishlist.map((item: any) => productArray.push({ id: item?.product?.id, title: item?.product?.title, price: item?.product?.price, image: item?.product?.mainImage, slug: item?.product?.slug, stockAvailabillity: item?.product?.inStock }));

    setWishlist(productArray);
  };

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
  }, [session?.user?.email]);

  return (
    <header suppressHydrationWarning>
      {/* HeaderTop only for website */}
      {pathname.startsWith("/admin") === false && <HeaderTop />}

      <AppBar position="static" sx={{ bgcolor: "white", boxShadow: 3, borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", py: 1.5 }}>

            {/* Logo */}
            <Link href="/">
              {pathname.startsWith("/admin") ? (
                <Image src="/logo_new.png" width={130} height={130} alt="singitronic logo" className="w-56 h-auto" />
              ) : (
                <Image src="/logo_new.png" width={300} height={300} alt="singitronic logo" className="relative right-5 max-[1023px]:w-56" />
              )}
            </Link>

            {/* Website Header */}
            {pathname.startsWith("/admin") === false && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Paper
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                    py: 0.3,
                    borderRadius: 3,
                    minWidth: { xs: "200px", md: "400px" },
                    boxShadow: 2
                  }}
                >
                  <SearchInput />
                </Paper>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <NotificationBell sx={{ cursor: "pointer", "&:hover": { color: "#2563eb" } }} />
                  <HeartElement wishQuantity={wishQuantity} />
                  <CartElement />
                </Box>
              </Box>
            )}

            {/* Admin Header */}
            {pathname.startsWith("/admin") && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <NotificationBell sx={{ cursor: "pointer", "&:hover": { color: "#2563eb" } }} />
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
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 text-gray-800"
                  >
                    <li>
                      <Link href="/admin" className="hover:text-blue-600">Dashboard</Link>
                    </li>
                    <li>
                      <a className="hover:text-blue-600">Profile</a>
                    </li>
                    <li onClick={handleLogout}>
                      <a href="#" className="hover:text-red-600">Logout</a>
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
