"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSortStore } from "@/app/_zustand/sortStore";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import apiClient from "@/lib/api";

interface InputCategory {
  inStock: { text: string; isChecked: boolean };
  outOfStock: { text: string; isChecked: boolean };
  priceFilter: { text: string; value: number };
  ratingFilter: { text: string; value: number };
}

const Filters = () => {
  const pathname = usePathname();
  const { replace } = useRouter();
    const router = useRouter();

  const { page } = usePaginationStore();
  const { sortBy } = useSortStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [inputCategory, setInputCategory] = useState<InputCategory>({
    inStock: { text: "instock", isChecked: true },
    outOfStock: { text: "outofstock", isChecked: true },
    priceFilter: { text: "price", value: 3000 },
    ratingFilter: { text: "rating", value: 0 },
  });


  // ✅ Fetch categories
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/api/categories"); // fetch wrapper
      const data = await res.json(); // ✅ fetch me json parse karna padta hai
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  fetchCategories();
}, []);


  // ✅ Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("outOfStock", inputCategory.outOfStock.isChecked.toString());
    params.set("inStock", inputCategory.inStock.isChecked.toString());
    params.set("rating", inputCategory.ratingFilter.value.toString());
    params.set("price", inputCategory.priceFilter.value.toString());
    params.set("sort", sortBy);
    params.set("page", page.toString());
    replace(`${pathname}?${params}`);
  }, [inputCategory, sortBy, page]);

  return (
    <div className="w-60 h-screen sticky top-20 overflow-y-auto bg-white shadow-md p-3 rounded-lg">
      {/* ✅ Categories Bar */}
      <h3 className="text-2xl mb-2">Categories</h3>
      <div className="divider"></div>
     <div className="flex flex-wrap gap-2 justify-start overflow-x-auto scrollbar-hide pb-3">
  {categories.length > 0 ? (
    categories.map((cat) => (
      <div
        key={cat.id || cat._id}
        onClick={() =>
          router.push(`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`)
        } // ✅ added navigation
        className="flex-shrink-0 border border-gray-200 bg-white px-3 py-1 rounded-md shadow-sm 
                   text-gray-700 font-medium hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 
                   cursor-pointer transition-all duration-200"
      >
        {cat.name || cat.title}
      </div>
    ))
  ) : (
    <p className="text-gray-400 text-sm">Loading categories...</p>
  )}
</div>


      {/* ✅ Filters Section */}
      <h3 className="text-2xl mb-2">Filters</h3>
      <div className="divider"></div>

      {/* Availability */}
      <div className="flex flex-col gap-y-1">
        <h3 className="text-xl mb-2">Availability</h3>
        <div className="form-control">
          <label className="cursor-pointer flex items-center">
            <input
              type="checkbox"
              checked={inputCategory.inStock.isChecked}
              onChange={() =>
                setInputCategory({
                  ...inputCategory,
                  inStock: {
                    text: "instock",
                    isChecked: !inputCategory.inStock.isChecked,
                  },
                })
              }
              className="checkbox"
            />
            <span className="label-text text-lg ml-2 text-black">In stock</span>
          </label>
        </div>

        <div className="form-control">
          <label className="cursor-pointer flex items-center">
            <input
              type="checkbox"
              checked={inputCategory.outOfStock.isChecked}
              onChange={() =>
                setInputCategory({
                  ...inputCategory,
                  outOfStock: {
                    text: "outofstock",
                    isChecked: !inputCategory.outOfStock.isChecked,
                  },
                })
              }
              className="checkbox"
            />
            <span className="label-text text-lg ml-2 text-black">
              Out of stock
            </span>
          </label>
        </div>
      </div>

      <div className="divider"></div>

      {/* Price Filter */}
      <div className="flex flex-col gap-y-1">
        <h3 className="text-xl mb-2">Price</h3>
        <div>
          <input
            type="range"
            min={0}
            max={3000}
            step={10}
            value={inputCategory.priceFilter.value}
            className="range"
            onChange={(e) =>
              setInputCategory({
                ...inputCategory,
                priceFilter: {
                  text: "price",
                  value: Number(e.target.value),
                },
              })
            }
          />
          <span>{`Max price: $${inputCategory.priceFilter.value}`}</span>
        </div>
      </div>

      <div className="divider"></div>

      {/* Rating Filter */}
      <div>
        <h3 className="text-xl mb-2">Minimum Rating:</h3>
        <input
          type="range"
          min={0}
          max="5"
          value={inputCategory.ratingFilter.value}
          onChange={(e) =>
            setInputCategory({
              ...inputCategory,
              ratingFilter: { text: "rating", value: Number(e.target.value) },
            })
          }
          className="range range-info"
          step="1"
        />
        <div className="w-full flex justify-between text-xs px-2">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    </div>
  );
};

export default Filters;
