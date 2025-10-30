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
<<<<<<< HEAD

=======
import { useProductStore } from "@/app/_zustand/store";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";
>>>>>>> a89075feae2df4122e816472412706b5aad17a94
const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {
<<<<<<< HEAD
  return (
    <div className="flex flex-col items-center gap-y-2">
      <Link href={`/product/${product.slug}`}>
        <Image
          src={
            product.mainImage
              ? `/${product.mainImage}`
              : "/product_placeholder.jpg"
          }
          width="0"
          height="0"
          sizes="100vw"
          className="w-auto h-[300px]"
          alt={sanitize(product?.title) || "Product image"}
        />
      </Link>
      <Link
        href={`/product/${product.slug}`}
        className={
          color === "black"
            ? `text-xl text-black font-normal mt-2 uppercase`
            : `text-xl text-white font-normal mt-2 uppercase`
        }
      >
        {sanitize(product.title)}
      </Link>
      <p
        className={
          color === "black"
            ? "text-lg text-black font-semibold"
            : "text-lg text-white font-semibold"
        }
      >
        ${product.price}
      </p>
=======
  const { addToCart } = useProductStore();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(
    wishlist.some(item => item.id === product.id)
  );
>>>>>>> a89075feae2df4122e816472412706b5aad17a94

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
    <div className="flex flex-col h-full">
      {/* Product Image with Overlay Actions */}
      <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            width={180}
            height={180}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            alt={sanitize(product?.title) || "Product image"}
          />
        </Link>
        
        {/* Overlay Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlistToggle}
            className={`p-1.5 rounded-full shadow-lg transition-colors duration-200 ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <Link
          href={`/product/${product.slug}`}
          className={
            color === "black"
              ? `text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2`
              : `text-sm font-medium text-white hover:text-blue-300 transition-colors line-clamp-2 mb-2`
          }
        >
          {sanitize(product.title)}
        </Link>
        
        <div className="flex items-center gap-2 mb-2">
          <p
            className={
              color === "black"
                ? "text-lg font-bold text-blue-600"
                : "text-lg font-bold text-white"
            }
          >
            ₹{product.price}
          </p>
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

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/product/${product?.slug}`}
            className="flex-1 flex justify-center items-center gap-1 bg-blue-600 text-white px-3 py-2 text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Eye size={14} />
            <span>View</span>
          </Link>
          
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`flex-1 flex justify-center items-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
              isInStock
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
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
