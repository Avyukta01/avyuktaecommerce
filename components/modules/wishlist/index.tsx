"use client";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import WishItem from "@/components/WishItem";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const WishlistModule = () => {
  const { data: session } = useSession();
  const { wishlist, setWishlist } = useWishlistStore();

  const getWishlistByUserId = async (id: string) => {
    try {
      const response = await apiClient.get(`/api/wishlist/${id}`, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Failed to fetch wishlist");

      const wishlistData = await response.json();

      const productArray = wishlistData.map((item: any) => ({
        id: item?.product?.id,
        title: item?.product?.title,
        price: item?.product?.price,
        image: item?.product?.mainImage,
        slug: item?.product?.slug,
        stockAvailabillity: item?.product?.inStock,
      }));

      setWishlist(productArray);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const getUserByEmail = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await apiClient.get(
        `/api/users/email/${session.user.email}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error("Failed to fetch user");

      const user = await response.json();
      if (user?.id) getWishlistByUserId(user.id);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.email) getUserByEmail();
  }, [session?.user?.email]); // ✅ no wishlist.length here

  return (
    <>
      {wishlist.length === 0 ? (
        <h3 className="text-center text-4xl py-10 text-black max-lg:text-3xl max-sm:text-2xl max-sm:pt-5 max-[400px]:text-xl">
          No items found in the wishlist
        </h3>
      ) : (
        <div className="max-w-screen-2xl mx-auto">
          <div className="overflow-x-auto">
            <table className="table text-center">
              <thead>
                <tr>
                  <th></th>
                  <th className="text-accent-content">Image</th>
                  <th className="text-accent-content">Name</th>
                  <th className="text-accent-content">Stock Status</th>
                  <th className="text-accent-content">Action</th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((item) => (
                  <WishItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    image={item.image}
                    slug={item.slug}
                    stockAvailabillity={item.stockAvailabillity}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
