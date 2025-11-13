"use client";
import { ProductInCart, useProductStore } from "@/app/_zustand/store";
import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import toast from "react-hot-toast";

const QuantityInputCart = ({ product }: { product: ProductInCart }) => {
  const [quantityCount, setQuantityCount] = useState<number>(product.amount);
  const { updateCartAmount, calculateTotals } = useProductStore();

 const handleQuantityChange = (actionName: string): void => {
  if (actionName === "plus") {
    const newQty = quantityCount + 1;

    // 🔍 Compare newQty directly with stock
    if (newQty > product.inStock) {
      toast.error(`Only ${product.inStock} item(s) available in stock.`);
      return;
    }

    setQuantityCount(newQty);
    updateCartAmount(product.id, newQty);
    calculateTotals();
  } 
  else if (actionName === "minus") {
    if (quantityCount > 1) {
      const newQty = quantityCount - 1;
      setQuantityCount(newQty);
      updateCartAmount(product.id, newQty);
      calculateTotals();
    }
  }
};


  return (
    <div>
      <label htmlFor="Quantity" className="sr-only">
        Quantity
      </label>

      <div className="flex items-center justify-center rounded border border-gray-200 w-32">
        <button
          type="button"
          className="size-10 leading-10 text-gray-600 transition hover:opacity-75 flex items-center justify-center"
          onClick={() => handleQuantityChange("minus")}
        >
          <FaMinus />
        </button>

        <input
          type="number"
          id="Quantity"
          disabled
          value={quantityCount}
          className="h-10 w-16 border-transparent text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          className="size-10 leading-10 text-gray-600 transition hover:opacity-75 flex items-center justify-center"
          onClick={() => handleQuantityChange("plus")}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default QuantityInputCart;
