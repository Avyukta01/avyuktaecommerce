"use client";

import { useEffect, useState } from "react";
import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { FaCheck, FaCircleQuestion, FaClock } from "react-icons/fa6";
import QuantityInputCart from "@/components/QuantityInputCart";
import { sanitize } from "@/lib/sanitize";

export const CartModule = () => {
  const { products, removeFromCart, calculateTotals, total } = useProductStore();
  const [totalDiscount, setTotalDiscount] = useState<number>(0);

  // ✅ Automatically recalculate totals whenever products change
  useEffect(() => {
    calculateTotals();
    if (products.length > 0) {
      fetchDiscountFromBackend();
    } else {
      setTotalDiscount(0);
    }
  }, [products, calculateTotals]);

  // ✅ Fetch total discount from backend (based on product IDs)
  const fetchDiscountFromBackend = async () => {
    try {
      let totalDisc = 0;

      for (const product of products) {
        const res = await fetch(`/api/product-discounts/${product.id}`);
        const data = await res.json();

        // find the applicable discount from backend slab logic
        const quantity = Number(product.quantity) || 0;
        let discountPercent = 0;

        if (Array.isArray(data)) {
          for (const slab of data) {
            if (
              quantity >= Number(slab.minQuantity) &&
              quantity <= Number(slab.maxQuantity)
            ) {
              discountPercent = Number(slab.discountPercent);
              break;
            }
          }
        }

        // calculate discount amount (price × quantity × discount%)
        const discountAmount =
          (Number(product.price) * quantity * discountPercent) / 100;
        totalDisc += discountAmount;
      }

      setTotalDiscount(totalDisc);
    } catch (error) {
      console.error("❌ Error fetching discounts:", error);
      setTotalDiscount(0);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success("Product removed from the cart");
  };

  const shipping = products.length > 0 ? 0 : 0;
  const orderTotal = total - totalDiscount + shipping;

  return (
    <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
      {/* Left Side — Product List */}
      <section
        aria-labelledby="cart-heading"
        className="lg:col-span-7 h-[70vh] overflow-y-auto pr-2 scrollbar-hide"
      >
        <h2 id="cart-heading" className="sr-only">
          Items in your shopping cart
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-500 mt-6">
            Your cart is empty.
          </p>
        ) : (
          <ul
            role="list"
            className="divide-y divide-gray-200 border-b border-t border-gray-200"
          >
            {products.map((product) => (
              <li key={product.id} className="flex py-4 sm:py-6 gap-4">
                {/* Product Image + Quantity */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <Image
                    width={100}
                    height={100}
                    src={
                      product?.image
                        ? `/${product.image}`
                        : "/product_placeholder.jpg"
                    }
                    alt="Product image"
                    className="h-20 w-20 rounded-md object-cover object-center sm:h-28 sm:w-28"
                  />
                  <div className="mt-3">
                    <QuantityInputCart product={product} />
                  </div>
                </div>

                {/* Product details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-[22px] font-semibold text-gray-900 leading-snug hover:text-gray-800 transition-colors duration-200">
                      <Link href="#">{sanitize(product.title)}</Link>
                    </h3>
                    <p className="mt-1 text-[16px] font-medium text-gray-700">
                      ₹{product.price}
                    </p>
                  </div>

                  <div className="mb-[7px] flex items-center justify-between text-[16px] text-gray-700">
                    <div className="flex items-center gap-2">
                      <FaCheck
                        className="h-4 w-4 flex-shrink-0 text-green-500"
                        aria-hidden="true"
                      />
                      <span>In stock</span>
                      <button
                        onClick={() => handleRemoveItem(product.id)}
                        type="button"
                        className="text-red-500 font-medium hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </section>

      {/* Right Side — Summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 sticky top-24 self-start"
      >
        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
          Order summary
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Subtotal</dt>
            <dd className="text-sm font-medium text-gray-900">
              ₹{total.toFixed(2)}
            </dd>
          </div>

          {/* <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex items-center text-sm text-gray-600">
              <span>Shipping estimate</span>
              <FaCircleQuestion className="ml-2 h-5 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm font-medium text-gray-900">₹{shipping}</dd>
          </div> */}

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex text-sm text-gray-600">
              <span>Discount</span>
              <FaCircleQuestion className="ml-2 h-5 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              -₹{totalDiscount.toFixed(2)}
            </dd>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">Order total</dt>
            <dd className="text-base font-medium text-gray-900">
              ₹{orderTotal.toFixed(2)}
            </dd>
          </div>
        </dl>

        {products.length > 0 && (
          <div className="mt-6">
            <Link
              href="/checkout"
              className="block flex justify-center items-center w-full uppercase bg-white px-4 py-3 text-base border border-black border-gray-300 font-bold text-blue-600 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2"
            >
              Checkout
            </Link>
          </div>
        )}
      </section>
    </form>
  );
};
  