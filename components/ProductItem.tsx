"use client"; // <-- ADD THIS AS THE VERY FIRST LINE

// *********************
// Role of the component: Enhanced Product item component with cart and wishlist functionality
// Name of the component: ProductItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component with cart, wishlist, and navigation functionality
// *********************

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductItemRating from "./ProductItemRating";
import { sanitize } from "@/lib/sanitize";

import { useProductStore } from "@/app/_zustand/store";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";

const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {

  const { addToCart } = useProductStore();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(
    wishlist.some(item => item.id === product.id)
  );


  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartProduct = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.mainImage,
      amount: 1,
    };
    
    addToCart(cartProduct);
    toast.success("Product added to cart!");
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
      setIsWishlisted(false);
      toast.success("Removed from wishlist");
    } else {
      const wishlistProduct = {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.mainImage,
        slug: product.slug,
        stockAvailabillity: product.inStock,
      };
      
      addToWishlist(wishlistProduct);
      setIsWishlisted(true);
      toast.success("Added to wishlist");
    }
  };

  const isInStock = product.inStock > 0;

  return (
   <div className="group flex flex-col h-full bg-white  shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
  {/* Product Image */}
  <div className="relative h-40 flex items-center justify-center overflow-hidden rounded-t-2xl bg-white">
    <Link href={`/product/${product.slug}`}>
      <Image
        src={
          product.mainImage
            ? `/${product.mainImage}`
            : "/product_placeholder.jpg"
        }
        width={180}
        height={180}
        className="object-contain transition-transform duration-500 group-hover:scale-105"
        alt={sanitize(product?.title) || 'Product image'}
      />
    </Link>

    {/* Wishlist Button */}
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        onClick={handleWishlistToggle}
        className={`p-2 rounded-full shadow-md border transition-all duration-200 ${
          isWishlisted
            ? "bg-red-500 text-white border-transparent"
            : "bg-white text-gray-700 hover:bg-red-500 hover:text-white border-gray-200"
        }`}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
      </button>
    </div>
  </div>

  {/* Product Info */}
  <div className="p-4 flex flex-col flex-grow">
    <Link
      href={`/product/${product.slug}`}
      className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2"
    >
      {sanitize(product.title)}
    </Link>

    <div className="flex items-center justify-between mb-2">
      <p className="text-lg font-bold text-blue-600">₹{product.price}</p>
      <ProductItemRating productRating={product?.rating} />
    </div>

    {/* Stock Status */}
    <div className="text-xs mb-3">
      {isInStock ? (
        <span className="text-green-600 font-medium">In Stock</span>
      ) : (
        <span className="text-red-600 font-medium">Out of Stock</span>
      )}
    </div>

    {/* Buttons */}
    <div className="flex gap-2 mt-auto">
      <Link
        href={`/product/${product?.slug}`}
        className="flex-1 flex justify-center items-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-all duration-300 shadow-sm border border-blue-100"
      >
        <Eye size={14} />
        <span>View</span>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={!isInStock}
        className={`flex-1 flex justify-center items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
          isInStock
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        <ShoppingCart size={14} />
        <span className="hidden sm:inline">{isInStock ? 'Add' : 'Out'}</span>
      </button>
    </div>
  </div>
</div>


  );
};

export default ProductItem;
