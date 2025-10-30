"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { sanitize } from "@/lib/sanitize";

const SearchInput = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const router = useRouter();


  // function for modifying URL for searching products
  const searchProducts = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Sanitize the search input before using it in URL

    const sanitizedSearch = sanitize(searchInput);
    router.push(`/search?search=${encodeURIComponent(sanitizedSearch)}`);
    setSearchInput("");
  };

  return (
    <form
      onSubmit={searchProducts}
      className="flex items-center w-full max-w-xl mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:shadow-md transition-all duration-300"
    >
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search for products..."
        className="w-full px-4 py-2 text-gray-700 placeholder-gray-400 bg-white border-none outline-none focus:ring-0"
      />

      <button
        type="submit"
        className="px-6 py-2 bg-blue-800 text-white font-medium hover:bg-gray-700 transition-all duration-200"
      >
        Search
      </button>
    </form>
  );
};

export default SearchInput;
