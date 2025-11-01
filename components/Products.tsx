import React from "react";
import apiClient from "@/lib/api";

const Products = async ({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  // 🧠 Prepare filters
  const inStockNum = searchParams?.inStock === "true" ? 1 : 0;
  const outOfStockNum = searchParams?.outOfStock === "true" ? 1 : 0;
  const page = searchParams?.page ? Number(searchParams?.page) : 1;

  let stockMode: string = "lte";
  if (inStockNum === 1) stockMode = "equals";
  if (outOfStockNum === 1) stockMode = "lt";
  if (inStockNum === 1 && outOfStockNum === 1) stockMode = "lte";
  if (inStockNum === 0 && outOfStockNum === 0) stockMode = "gt";

  let products: any[] = [];

  try {
    const data = await apiClient.get(
      `/api/products?filters[price][$lte]=${
        searchParams?.price || 3000
      }&filters[rating][$gte]=${
        Number(searchParams?.rating) || 0
      }&filters[inStock][$${stockMode}]=1&${
        params?.slug?.length! > 0
          ? `filters[category][$equals]=${params?.slug}&`
          : ""
      }sort=${searchParams?.sort}&page=${page}`
    );

    if (!data.ok) {
      console.error("Failed to fetch products:", data.statusText);
      products = [];
    } else {
      const result = await data.json();
      products = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    products = [];
  }

  // 🧱 Static fallback
  if (!products.length) {
    products = [
      {
        id: 1,
        name: "Smartphone Pro Max",
        description: "Powerful smartphone with ",
        price: 49999,
        rating: 4.8,
        image: "https://m.media-amazon.com/images/I/81fxjeu8fdL._SL1500_.jpg",
      },
      {
        id: 2,
        name: "Wireless Headphones",
        description: "Noise-cancelling over-ear headphones",
        price: 12999,
        rating: 4.5,
        image: "https://m.media-amazon.com/images/I/71S8U9VzLTL._SL1500_.jpg",
      },
      {
        id: 3,
        name: "Gaming Laptop RTX",
        description: "High-performance laptop with RTX",
        price: 89999,
        rating: 4.7,
        image: "https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg",
      },
      {
        id: 4,
        name: "Smart Watch X",
        description: "Fitness tracking and heart rate monitor",
        price: 14999,
        rating: 4.3,
        image: "https://m.media-amazon.com/images/I/61T7Z9+6fDL._SL1500_.jpg",
      },
      {
        id: 5,
        name: "Bluetooth Speaker Boom",
        description: "Deep bass portable Bluetooth speaker",
        price: 3999,
        rating: 4.6,
        image: "/product5.webp",
      },
      {
        id: 6,
        name: "DSLR Camera",
        description: "Professional-grade DSLR with 24MP sensor",
        price: 55999,
        rating: 4.9,
        image: "/product6.webp",
      },
    ];
  }

  // 🎨 Blue Modern Design (Amazon/Flipkart style)
  return (
    <div className="grid grid-cols-3 gap-8 max-xl:grid-cols-2 max-md:grid-cols-1 ml-4">
  {products.map((product: any) => (
    <div
      key={product.id}
      className="bg-white border border-blue-100 rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="h-60 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
        <img
          src={product.image || '/placeholder.png'}
          alt={product.name}
          className="object-contain w-3/4 h-3/4 hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xl font-bold text-blue-600">
            ₹{product.price?.toLocaleString('en-IN')}
          </p>
          <p className="text-yellow-500 font-medium text-sm">
            ⭐ {product.rating}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
            Add to Cart
          </button>
          <button className="flex-1 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

    // <div className="container mx-auto px-6 py-12 ">
     

    //   <div className="grid grid-cols-4 gap-8 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
    //     {products.map((product: any) => (
    //       <div
    //         key={product.id}
    //         className="bg-white border border-blue-100 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
    //       >
    //         {/* Product Image */}
    //         <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
    //           <img
    //             src={product.image || "/placeholder.png"}
    //             alt={product.name}
    //             className="object-contain w-full h-full hover:scale-110 transition-transform duration-300"
    //           />
    //         </div>

    //         {/* Product Info */}
    //         <div className="p-6 flex flex-col justify-between">
    //           <div>
    //             <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
    //               {product.name}
    //             </h3>
    //             <p className="text-gray-600 text-sm mb-4 line-clamp-2">
    //               {product.description}
    //             </p>
    //           </div>

    //           <div className="flex items-center justify-between mb-4">
    //             <p className="text-2xl font-bold text-[#2563EB]">
    //               ₹{product.price?.toLocaleString("en-IN")}
    //             </p>
    //             <p className="text-yellow-500 font-medium text-sm">
    //               ⭐ {product.rating}
    //             </p>
    //           </div>

    //           {/* Buttons */}
    //           <div className="flex gap-3">
    //             <button className="flex-1 py-2 bg-[#1E3A8A] text-white font-semibold rounded-lg hover:bg-[#2563EB] transition-all">
    //               Add to Cart
    //             </button>
    //             <button className="flex-1 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all">
    //               Buy Now
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
};

export default Products;
