"use client";

import React, { useState } from "react";
import { formatCategoryName } from "@/utils/categoryFormating";
import { sanitize, sanitizeHtml } from "@/lib/sanitize";
import { Package, Palette, Tag } from "lucide-react";

interface Product {
  description?: string;
  manufacturer?: string;
  category?: { name?: string };
}

const ProductTabs = ({ product }: { product: Product }) => {
  const [currentProductTab, setCurrentProductTab] = useState<number>(0);

  const tabs = [
    { id: 0, label: "Description" },
    { id: 1, label: "Additional info" },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Product tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentProductTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 relative
                ${
                  currentProductTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
              aria-current={currentProductTab === tab.id ? "page" : undefined}
            >
              {tab.label}
              {currentProductTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {/* Description Tab */}
        {currentProductTab === 0 && (
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(product?.description || "No description available."),
              }}
            />
          </div>
        )}

        {/* Additional Info Tab */}
        {currentProductTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manufacturer */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Manufacturer</h4>
              </div>
              <p className="text-gray-700">
                {sanitize(product?.manufacturer || "Not specified")}
              </p>
            </div>

            {/* Category */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Category</h4>
              </div>
              <p className="text-gray-700">
                {product?.category?.name
                  ? sanitize(formatCategoryName(product.category.name))
                  : "No category"}
              </p>
            </div>

            {/* Color (Static - as in original) */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Color</h4>
              </div>
              <p className="text-gray-700">Silver, LightSlateGray, Blue</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;