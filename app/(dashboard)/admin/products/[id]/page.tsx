"use client";
import { CustomButton, DashboardSidebar, SectionTitle } from "@/components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import { nanoid } from "nanoid";
import apiClient from "@/lib/api";

interface DashboardProductDetailsProps {
  params: Promise<{ id: string }>;
}

interface DiscountRange {
  minQuantity: number;
  maxQuantity: number;
  discountPercent: number;
}


const DashboardProductDetails = ({ params }: DashboardProductDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState<Product>();
  const [categories, setCategories] = useState<Category[]>();
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const router = useRouter();

  const [discountRanges, setDiscountRanges] = useState<DiscountRange[]>([]);
const [newDiscount, setNewDiscount] = useState<DiscountRange>({
  minQuantity: 0,
  maxQuantity: 0,
  discountPercent: 0,
});
const [loadingDiscounts, setLoadingDiscounts] = useState(false);
const [savingDiscounts, setSavingDiscounts] = useState(false);


  // functionality for deleting product
  const deleteProduct = async () => {
    const requestOptions = {
      method: "DELETE",
    };
    apiClient
      .delete(`/api/products/${id}`, requestOptions)
      .then((response) => {
        if (response.status !== 204) {
          if (response.status === 400) {
            toast.error(
              "Cannot delete the product because of foreign key constraint"
            );
          } else {
            throw Error("There was an error while deleting product");
          }
        } else {
          toast.success("Product deleted successfully");
          router.push("/admin/products");
        }
      })
      .catch((error) => {
        toast.error("There was an error while deleting product");
      });
  };

  // functionality for updating product
  const updateProduct = async () => {
    if (
      product?.title === "" ||
      product?.slug === "" ||
      product?.price.toString() === "" ||
      product?.manufacturer === "" ||
      product?.description === ""
    ) {
      toast.error("You need to enter values in input fields");
      return;
    }

    try {
      const response = await apiClient.put(`/api/products/${id}`, product);

      if (response.status === 200) {
        await response.json();
        toast.success("Product successfully updated");
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "There was an error while updating product"
        );
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("There was an error while updating product");
    }
  };


  const fetchDiscounts = async () => {
  try {
    setLoadingDiscounts(true);
    const res = await apiClient.get(`/api/product-discounts/${id}`);
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message || "Failed to load discounts");
      return;
    }
    const data: DiscountRange[] = await res.json();
    setDiscountRanges(Array.isArray(data) ? data : []);
  } catch {
    toast.error("Failed to load discounts");
  } finally {
    setLoadingDiscounts(false);
  }
};



const addDiscountRange = () => {
  const { minQuantity, maxQuantity, discountPercent } = newDiscount;

  if (!minQuantity || !maxQuantity || !discountPercent) {
    toast.error("Please fill all discount fields");
    return;
  }
  if (minQuantity > maxQuantity) {
    toast.error("Min quantity cannot be greater than max quantity");
    return;
  }

  setDiscountRanges((prev) => [...prev, { ...newDiscount }]);
  setNewDiscount({ minQuantity: 0, maxQuantity: 0, discountPercent: 0 });
};

const removeDiscount = (index: number) => {
  setDiscountRanges((prev) => prev.filter((_, i) => i !== index));
};

const saveDiscounts = async () => {
  if (!id) {
    toast.error("Missing product id");
    return;
  }
  if (discountRanges.length === 0) {
    toast("No discount ranges to save", { icon: "ℹ️" });
    return;
  }

  try {
    setSavingDiscounts(true);
    const res = await apiClient.post("/api/product-discounts", {
      productId: id,
      discounts: discountRanges,
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message || "Failed to save discounts");
      return;
    }

    toast.success(`${discountRanges.length} discount range(s) saved!`);
    await fetchDiscounts(); // refresh with server truth
  } catch {
    toast.error("Failed to save discounts");
  } finally {
    setSavingDiscounts(false);
  }
};



  // functionality for uploading main image file
  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post("/api/main-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
      } else {
        toast.error("File upload unsuccessful.");
      }
    } catch (error) {
      console.error("There was an error while during request sending:", error);
      toast.error("There was an error during request sending");
    }
  };

  // fetching main product data including other product images
  const fetchProductData = async () => {
    apiClient
      .get(`/api/products/${id}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setProduct(data);
      });

    const imagesData = await apiClient.get(`/api/images/${id}`, {
      cache: "no-store",
    });
    const images = await imagesData.json();
    setOtherImages((currentImages) => images);
  };

  // fetching all product categories. It will be used for displaying categories in select category input
  const fetchCategories = async () => {
    apiClient
      .get(`/api/categories`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchProductData();
    fetchDiscounts(); 
  }, [id]);

  


  return (

    <div className="xl: w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">

      <DashboardSidebar />
      <div className="pb-6 pt-4 border-b-2 border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Product details</h1>
        {/* Product name input div - start */}
        </div>
        <div className="flex justify-start items-center gap-x-10 max-sm:flex-col">
<div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title || ""}
              onChange={(e) =>
                setProduct({ ...product!, title: e.target.value })
              }
            />
          </label>
        </div>
<div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.price || ""}
              onChange={(e) =>
                setProduct({ ...product!, price: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Manufacturer:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.manufacturer || ""}
              onChange={(e) =>
                setProduct({ ...product!, manufacturer: e.target.value })
              }
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={
                product?.slug ? convertSlugToURLFriendly(product?.slug) : ""
              }
              onChange={(e) =>
                setProduct({
                  ...product!,
                  slug: convertSlugToURLFriendly(e.target.value),
                })
              }
            />
          </label>
        </div>
        </div>
        

        <div className="flex justify-start items-center gap-x-10 max-sm:flex-col">
          
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered w-64"
              value={product?.inStock ?? 1}
              onChange={(e) => {
                setProduct({ ...product!, inStock: Number(e.target.value) });
              }}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered w-64"
              value={product?.categoryId || ""}
              onChange={(e) =>
                setProduct({
                  ...product!,
                  categoryId: e.target.value,
                })
              }
            >
              {categories &&
                categories.map((category: Category) => (
                  <option key={category?.id} value={category?.id}>
                    {formatCategoryName(category?.name)}
                  </option>
                ))}
            </select>
          </label>
        </div>

       <div className="flex items-center gap-6">
  {/* Left: File Input + (optional) selected file name */}
  <div className="flex-1 max-w-xs mt-5">
    <input
      type="file"
      className="file-input file-input-bordered file-input-sm w-full"
      onChange={(e) => {
        // @ts-ignore
        const selectedFile = e.target.files[0];

        if (selectedFile) {
          uploadFile(selectedFile);
          setProduct({ ...product!, mainImage: selectedFile.name });
        }
      }}
    />
    {product?.mainImage && (
      <p className="text-xs text-gray-600 mt-1 truncate">
        {product.mainImage}
      </p>
    )}
  </div>

  {/* Right: Small rounded image preview – vertically centered */}
  {product?.mainImage && (
    <div className="flex-shrink-0 mt-3">
      <Image
        src={`/${product.mainImage}`}
        alt={product?.title || "Product image"}
        width={80}
        height={80}
        className="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-200"
      />
    </div>
  )}
</div>

        </div>
      
                {/* Discount Ranges (Optional) */}
<div className="mt-8 w-full lg:w-2/3">
  <h3 className="text-xl font-semibold mb-4">Discount </h3>

  {/* Add new discount inputs */}
  <div className="flex flex-wrap gap-4 mb-4">
    <input
      type="number"
      placeholder="Min Qty"
      value={newDiscount.minQuantity || ""}
      onChange={(e) =>
        setNewDiscount({ ...newDiscount, minQuantity: Number(e.target.value) })
      }
      className="px-4 py-2 border rounded-lg w-24 focus:ring-2 focus:ring-blue-500"
    />
    <input
      type="number"
      placeholder="Max Qty"
      value={newDiscount.maxQuantity || ""}
      onChange={(e) =>
        setNewDiscount({ ...newDiscount, maxQuantity: Number(e.target.value) })
      }
      className="px-4 py-2 border rounded-lg w-24 focus:ring-2 focus:ring-blue-500"
    />
    <input
      type="number"
      placeholder="Discount %"
      value={newDiscount.discountPercent || ""}
      onChange={(e) =>
        setNewDiscount({
          ...newDiscount,
          discountPercent: Number(e.target.value),
        })
      }
      className="px-4 py-2 border rounded-lg w-28 focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="button"
      onClick={addDiscountRange}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      Add
    </button>
  </div>

  {/* Show list */}
  <div className="overflow-x-auto border rounded-lg">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2">Min Qty</th>
          <th className="px-4 py-2">Max Qty</th>
          <th className="px-4 py-2">Discount %</th>
          <th className="px-4 py-2 text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {loadingDiscounts ? (
          <tr>
            <td className="px-4 py-3" colSpan={4}>Loading discounts…</td>
          </tr>
        ) : discountRanges.length > 0 ? (
          discountRanges.map((d, i) => (
            <tr key={`${d.minQuantity}-${d.maxQuantity}-${i}`} className="border-t">
              <td className="px-4 py-2">{d.minQuantity}</td>
              <td className="px-4 py-2">{d.maxQuantity}</td>
              <td className="px-4 py-2">{d.discountPercent}%</td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => removeDiscount(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-4 py-3" colSpan={4}>No discount ranges added</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Save button */}
  <div className="mt-4">
    <button
      type="button"
      onClick={saveDiscounts}
      disabled={savingDiscounts}
      className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {savingDiscounts ? "Saving…" : "Save Discounts"}
    </button>
  </div>
</div>

        <div className="flex justify-start items-center gap-x-10 max-sm:flex-col">
          <div className="w-full lg:w-1/2">
          <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product?.description || ""}
              onChange={(e) =>
                setProduct({ ...product!, description: e.target.value })
              }
            ></textarea>
          </label>
        </div>
          </div>
        </div>


        
        {/* Product description div - end */}
        {/* Action buttons div - start */}
        <div className="flex justify-end items-center gap-x-10 max-sm:flex-col">
         
          
    <div className="flex justify-center items-center gap-x-4 max-sm:flex-col mt-5">
  <button
    type="button"
    className="uppercase bg-blue-500 w-auto inline-flex justify-center items-center px-5 py-2 text-sm font-semibold text-white border border-gray-300 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
    onClick={updateProduct}
  >
    Update product
  </button>

  <button
    type="button"
    className="uppercase bg-red-600 w-auto inline-flex justify-center items-center px-5 py-2 text-sm font-semibold text-white border border-gray-300 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-400 transition-all"
    onClick={deleteProduct}
  >
    Delete product
  </button>
</div>


        </div>
        
      
      </div>
    
  );
};

export default DashboardProductDetails;
