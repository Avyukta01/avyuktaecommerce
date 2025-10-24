'use client';

import React from 'react';
import ProductsSection from '@/components/ProductsSection';
import { useProductStore } from '@/app/_zustand/store';
import { useWishlistStore } from '@/app/_zustand/wishlistStore';

const TestProductsPage = () => {
  const { products: cartProducts, allQuantity, total } = useProductStore();
  const { wishlist, wishQuantity } = useWishlistStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Functionality Test</h1>
          <p className="text-gray-600">
            Test the enhanced product display with cart and wishlist functionality
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cart Status</h3>
            <p className="text-2xl font-bold text-blue-600">{allQuantity} items</p>
            <p className="text-sm text-gray-500">Total: ₹{total}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wishlist Status</h3>
            <p className="text-2xl font-bold text-red-600">{wishQuantity} items</p>
            <p className="text-sm text-gray-500">Saved for later</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Status</h3>
            <p className="text-2xl font-bold text-green-600">Ready</p>
            <p className="text-sm text-gray-500">All features enabled</p>
          </div>
        </div>

        {/* Cart Items */}
        {cartProducts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Items</h3>
            <div className="space-y-2">
              {cartProducts.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.amount}</p>
                  </div>
                  <p className="font-semibold">₹{item.price * item.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlist.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlist Items</h3>
            <div className="space-y-2">
              {wishlist.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">Stock: {item.stockAvailabillity}</p>
                  </div>
                  <p className="font-semibold">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Products</h2>
          <ProductsSection />
        </div>

        {/* Test Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Test Instructions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>✅ <strong>Add to Cart:</strong> Click the "Add to Cart" button on any product</p>
            <p>✅ <strong>Wishlist:</strong> Click the heart icon on any product to add/remove from wishlist</p>
            <p>✅ <strong>Product Details:</strong> Click "View" button or product title to navigate to product details</p>
            <p>✅ <strong>Stock Status:</strong> Products show "In Stock" or "Out of Stock" status</p>
            <p>✅ <strong>Responsive Design:</strong> Layout adapts to different screen sizes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestProductsPage;
