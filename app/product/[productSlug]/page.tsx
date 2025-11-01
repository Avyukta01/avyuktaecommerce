import {
  StockAvailabillity,
  SingleProductRating,
  ProductTabs,
  SingleProductDynamicFields,
  AddToWishlistBtn,
} from "@/components";
import apiClient from "@/lib/api";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";
import { FaTruck, FaLock, FaShieldAlt, FaChevronLeft } from "react-icons/fa";
import { sanitize } from "@/lib/sanitize";

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
  altText?: string;
  order?: number;
}

interface VideoItem {
  id: string;
  productId: string;
  videoUrl: string;
  title?: string;
  thumbnail?: string;
  order?: number;
}

interface SingleProductPageProps {
  params: Promise<{ productSlug: string; id: string }>;
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { productSlug, id } = await params;

  // 1️⃣ Fetch product details
  const productRes = await apiClient.get(`/api/slugs/${productSlug}`);
  const product = await productRes.json();

  // 2️⃣ Fetch product images
  const imagesRes = await apiClient.get(`/api/productImages/${product.id}`);
  const images = await imagesRes.json();

  // 3️⃣ ✅ Fetch product videos
  const videosRes = await apiClient.get(`/api/productVideos/${product.id}`);
  const videos = await videosRes.json();

  const safeImages: ImageItem[] = Array.isArray(images) ? images : [];
  const safeVideos: VideoItem[] = Array.isArray(videos) ? videos : [];

  if (!product || product.error) notFound();

  const getImageUrl = (name?: string) => {
    if (!name) return "/product_placeholder.jpg";
    return name.startsWith("/") ? name : `/${name}`;
  };

  const normalize = (path: string) => path.replace(/^\//, "").trim();

  let mainImageFilename: string | null = null;
  if (product?.mainImage && product.mainImage !== "") {
    mainImageFilename = product.mainImage;
  } else if (safeImages.length > 0) {
    mainImageFilename = safeImages[0].image;
  }

  const mainImageSrc = mainImageFilename
    ? getImageUrl(mainImageFilename)
    : "/product_placeholder.jpg";

  const thumbnails = safeImages
    .filter((img) => {
      if (!mainImageFilename) return true;
      return normalize(img.image) !== normalize(mainImageFilename);
    })
    .map((img) => getImageUrl(img.image));

  return (
    <>
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <FaChevronLeft className="w-3 h-3" />
            <a href="/products" className="hover:text-blue-600 transition-colors">
              Products
            </a>
            <FaChevronLeft className="w-3 h-3" />
            <span className="text-gray-900 font-medium">
              {sanitize(product?.title)}
            </span>
          </div>
        </div>
      </nav>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* 🖼️ IMAGE GALLERY */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative bg-white rounded-xl shadow-lg overflow-hidden max-w-lg mx-auto">
                <Image
                  src={mainImageSrc}
                  width={560}
                  height={560}
                  alt={sanitize(product?.title)}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
              </div>

              {/* ✅ 4 Images + 1 Video in One Horizontal Line */}
              {(safeImages.length > 0 || safeVideos.length > 0) && (
                <div className="mt-4 overflow-x-auto">
                  <div className="flex items-center gap-4 pb-2">
                    {/* Show only 4 images */}
                    {safeImages.slice(0, 4).map((img, i) => (
                      <div
                        key={img.imageID}
                        className="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-white shadow-md ring-2 ring-transparent hover:ring-blue-500 transition-all duration-200"
                      >
                        <Image
                          src={`/${img.image}`}
                          width={112}
                          height={112}
                          alt={img.altText || `Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}

                    {/* Show only 1 video */}
                    {safeVideos.slice(0, 1).map((video) => (
                      <div
                        key={video.id}
                        className="flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden bg-white shadow-md ring-2 ring-transparent hover:ring-blue-500 transition-all duration-200"
                      >
                        <video
                          controls
                          className="w-full h-full object-cover"
                          poster={video.thumbnail || ""}
                        >
                          <source
                            src={`/${video.videoUrl}`}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <SingleProductRating rating={product?.rating ?? 0} />
                <span className="text-sm text-gray-500">(3 reviews)</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {sanitize(product?.title)}
              </h1>

              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-blue-600">
                  ₹{product?.price}
                </span>
                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                  Price per Kg. Includes VAT
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700">Availability:</span>
                <StockAvailabillity stock={94} inStock={product?.inStock} />
              </div>

              <SingleProductDynamicFields product={product} />

              <div className="pt-3">
                <AddToWishlistBtn product={product} slug={productSlug} />
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
                {[
                  {
                    icon: FaTruck,
                    title: "Free Shipping",
                    desc: "Worldwide",
                    color: "blue",
                  },
                  {
                    icon: FaLock,
                    title: "Secure Payment",
                    desc: "SSL Encrypted",
                    color: "green",
                  },
                  {
                    icon: FaShieldAlt,
                    title: "2-Year Warranty",
                    desc: "Full Coverage",
                    color: "purple",
                  },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div
                      className={`p-2 rounded-full bg-${badge.color}-50 text-${badge.color}-600`}
                    >
                      <badge.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {badge.title}
                      </p>
                      <p className="text-xs text-gray-500">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="mt-20">
            <ProductTabs product={product} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleProductPage;
