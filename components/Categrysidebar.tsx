"use client";

import React, { useEffect, useState } from "react";

const Categorysidebar = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-full bg-white shadow-md rounded-lg p-3">
  <h3 className="text-2xl mb-2">Categories</h3>
  <div className="divider"></div>

  <div className="flex flex-wrap gap-3 justify-center md:justify-start overflow-x-auto scrollbar-hide py-2">
    {categories.length > 0 ? (
      categories.map((cat) => (
        <div
          key={cat.id || cat._id}
          className="flex-shrink-0 border border-gray-200 bg-white px-4 py-2 rounded-md shadow-sm 
                     text-gray-700 font-medium hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 
                     cursor-pointer transition-all duration-200"
        >
          {cat.name || cat.title}
        </div>
      ))
    ) : (
      <p className="text-gray-400 text-center w-full">No categories found</p>
    )}
  </div>
</div>

  );
};

export default Categorysidebar;
