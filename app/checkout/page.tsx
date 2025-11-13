"use client";
import { SectionTitle } from "@/components";
import { useProductStore } from "../_zustand/store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

const CheckoutPage = () => {
  const { data: session } = useSession();
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    company: "",
    adress: "",
    apartment: "",
    city: "",
    country: "",
    postalCode: "",
    orderNotice: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products, total, clearCart } = useProductStore();
  const router = useRouter();


const [totalDiscount, setTotalDiscount] = useState<number>(0);


const fetchDiscountFromBackend = async () => {
  try {
    let totalDisc = 0;

    for (const product of products) {
      const res = await fetch(`/api/product-discounts/${product.id}`);
      const data = await res.json();

      const quantity = Number(product.amount) || 0; // use amount from store
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

      // discount formula = price × quantity × %
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

// ✅ Auto-fetch discount when products change
useEffect(() => {
  if (products.length > 0) fetchDiscountFromBackend();
  else setTotalDiscount(0);
}, [products]);



  // Add validation functions that match server requirements
  const validateForm = () => {
    const errors: string[] = [];
    
    // Name validation
    if (!checkoutForm.name.trim() || checkoutForm.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    
    // Lastname validation
    if (!checkoutForm.lastname.trim() || checkoutForm.lastname.trim().length < 2) {
      errors.push("Lastname must be at least 2 characters");
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!checkoutForm.email.trim() || !emailRegex.test(checkoutForm.email.trim())) {
      errors.push("Please enter a valid email address");
    }
    
    // Phone validation (must be at least 10 digits)
    const phoneDigits = checkoutForm.phone.replace(/[^0-9]/g, '');
    if (!checkoutForm.phone.trim() || phoneDigits.length < 10) {
      errors.push("Phone number must be at least 10 digits");
    }
    
    // Company validation
    if (!checkoutForm.company.trim() || checkoutForm.company.trim().length < 5) {
      errors.push("Company must be at least 5 characters");
    }
    
    // Address validation
    if (!checkoutForm.adress.trim() || checkoutForm.adress.trim().length < 5) {
      errors.push("Address must be at least 5 characters");
    }
    
    // Apartment validation (updated to 1 character minimum)
    if (!checkoutForm.apartment.trim() || checkoutForm.apartment.trim().length < 1) {
      errors.push("Apartment is required");
    }
    
    // City validation
    if (!checkoutForm.city.trim() || checkoutForm.city.trim().length < 5) {
      errors.push("City must be at least 5 characters");
    }
    
    // Country validation
    if (!checkoutForm.country.trim() || checkoutForm.country.trim().length < 5) {
      errors.push("Country must be at least 5 characters");
    }
    
    // Postal code validation
    if (!checkoutForm.postalCode.trim() || checkoutForm.postalCode.trim().length < 3) {
      errors.push("Postal code must be at least 3 characters");
    }
    
    return errors;
  };

  const makePurchase = async () => {
    // Client-side validation first
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    // Basic client-side checks for required fields (UX only)
    const requiredFields = [
      'name', 'lastname', 'phone', 'email', 'company', 
      'adress', 'apartment', 'city', 'country', 'postalCode'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !checkoutForm[field as keyof typeof checkoutForm]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (products.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (total <= 0) {
      toast.error("Invalid order total");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🚀 Starting order creation...");
      
      // Get user ID if logged in
      let userId = null;
      if (session?.user?.email) {
        try {
          console.log("🔍 Getting user ID for logged-in user:", session.user.email);
          const userResponse = await apiClient.get(`/api/users/email/${session.user.email}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.id;
            console.log("✅ Found user ID:", userId);
          } else {
            console.log("❌ Could not find user with email:", session.user.email);
          }
        } catch (userError) {
          console.log("⚠️  Error getting user ID:", userError);
        }
      }
      
      // Prepare the order data
      const orderData = {
        name: checkoutForm.name.trim(),
        lastname: checkoutForm.lastname.trim(),
        phone: checkoutForm.phone.trim(),
        email: checkoutForm.email.trim().toLowerCase(),
        company: checkoutForm.company.trim(),
        adress: checkoutForm.adress.trim(),
        apartment: checkoutForm.apartment.trim(),
        postalCode: checkoutForm.postalCode.trim(),
        status: "pending",
        total: total,
        city: checkoutForm.city.trim(),
        country: checkoutForm.country.trim(),
        orderNotice: checkoutForm.orderNotice.trim(),
        userId: userId // Add user ID for notifications
      };

      console.log("📋 Order data being sent:", orderData);

      // Send order data to server for validation and processing
      const response = await apiClient.post("/api/orders", orderData);

      console.log("📡 API Response received:");
      console.log("  Status:", response.status);
      console.log("  Status Text:", response.statusText);
      console.log("  Response OK:", response.ok);
      
      // Check if response is ok before parsing
      if (!response.ok) {
        console.error("❌ Response not OK:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        
        // Try to parse as JSON to get detailed error info
        try {
          const errorData = JSON.parse(errorText);
          console.error("Parsed error data:", errorData);
          
          // Handle different error types
          if (response.status === 409) {
            // Duplicate order error
            toast.error(errorData.details || errorData.error || "Duplicate order detected");
            return; // Don't throw, just return to stop execution
          } else if (errorData.details && Array.isArray(errorData.details)) {
            // Validation errors
            errorData.details.forEach((detail: any) => {
              toast.error(`${detail.field}: ${detail.message}`);
            });
          } else if (typeof errorData.details === 'string') {
            // Single error message in details
            toast.error(errorData.details);
          } else {
            // Fallback error message
            toast.error(errorData.error || "Order creation failed");
          }
        } catch (parseError) {
          console.error("Could not parse error as JSON:", parseError);
          toast.error("Order creation failed. Please try again.");
        }
        
        return; // Stop execution instead of throwing
      }

      const data = await response.json();
      console.log("✅ Parsed response data:", data);
      
      const orderId: string = data.id;
      console.log("🆔 Extracted order ID:", orderId);

      if (!orderId) {
        console.error("❌ Order ID is missing or falsy!");
        console.error("Full response data:", JSON.stringify(data, null, 2));
        throw new Error("Order ID not received from server");
      }

      console.log("✅ Order ID validation passed, proceeding with product addition...");

      // Add products to order
      for (let i = 0; i < products.length; i++) {
        console.log(`🛍️ Adding product ${i + 1}/${products.length}:`, {
          orderId,
          productId: products[i].id,
          quantity: products[i].amount
        });
        
        await addOrderProduct(orderId, products[i].id, products[i].amount);
        console.log(`✅ Product ${i + 1} added successfully`);
      }

      console.log(" All products added successfully!");

      // Clear form and cart
      setCheckoutForm({
        name: "",
        lastname: "",
        phone: "",
        email: "",
        company: "",
        adress: "",
        apartment: "",
        city: "",
        country: "",
        postalCode: "",
        orderNotice: "",
      });
      clearCart();
      
      // Refresh notification count if user is logged in
      try {
        // This will trigger a refresh of notifications in the background
        window.dispatchEvent(new CustomEvent('orderCompleted'));
      } catch (error) {
        console.log('Note: Could not trigger notification refresh');
      }
      
      toast.success("Order created successfully! You will be contacted for payment.");
     setTimeout(() => {
  router.push(`/Orderstatus`);
}, 500);
    } catch (error: any) {
      console.error("💥 Error in makePurchase:", error);
      
      // Handle server validation errors
      if (error.response?.status === 400) {
        console.log(" Handling 400 error...");
        try {
          const errorData = await error.response.json();
          console.log("Error data:", errorData);
          if (errorData.details && Array.isArray(errorData.details)) {
            // Show specific validation errors
            errorData.details.forEach((detail: any) => {
              toast.error(`${detail.field}: ${detail.message}`);
            });
          } else {
            toast.error(errorData.error || "Validation failed");
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          toast.error("Validation failed");
        }
      } else if (error.response?.status === 409) {
        toast.error("Duplicate order detected. Please wait before creating another order.");
      } else {
        console.log("🔍 Handling generic error...");
        toast.error("Failed to create order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const addOrderProduct = async (
    orderId: string,
    productId: string,
    productQuantity: number
  ) => {
    try {
      console.log("️ Adding product to order:", {
        customerOrderId: orderId,
        productId,
        quantity: productQuantity
      });
      
      const response = await apiClient.post("/api/order-product", {
        customerOrderId: orderId,
        productId: productId,
        quantity: productQuantity,
      });

      console.log("📡 Product order response:", response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Product order failed:", response.status, errorText);
        throw new Error(`Product order failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Product order successful:", data);
      
    } catch (error) {
      console.error("💥 Error creating product order:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (products.length === 0) {
      toast.error("You don't have items in your cart");
      router.push("/cart");
    }
  }, []);

  return (
    <div className="bg-white">
      <SectionTitle title="Checkout" path="Home | Cart | Checkout" />
      
      <div className="hidden h-full w-1/2 bg-white lg:block" aria-hidden="true" />
      <div className="hidden h-full w-1/2 bg-gray-50 lg:block" aria-hidden="true" />

      <main className="relative mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
        <h1 className="sr-only">Order information</h1>

        {/* Order Summary */}
        <section
          aria-labelledby="summary-heading"
          className="bg-gray-50 px-4 pb-10 pt-16 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
        >
          <div className="mx-auto max-w-lg lg:max-w-none">
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            <ul
              role="list"
              className="divide-y divide-gray-200 text-sm font-medium text-gray-900"
            >
              {products.map((product) => (
                <li key={product?.id} className="flex items-start space-x-4 py-6">
                  <Image
                    src={product?.image ? `/${product?.image}` : "/product_placeholder.jpg"}
                    alt={product?.title}
                    width={80}
                    height={80}
                    className="h-20 w-20 flex-none rounded-md object-cover object-center"
                  />
                  <div className="flex-auto space-y-1">
                    <h3>{product?.title}</h3>
                    <p className="text-gray-500">x{product?.amount}</p>
                  </div>
                  <p className="flex-none text-base font-medium">
                    {product?.price}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="hidden space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-900 lg:block">
  <div className="flex items-center justify-between">
    <dt className="text-gray-600">Subtotal</dt>
    <dd>₹{total.toFixed(2)}</dd>
  </div>

  {/* <div className="flex items-center justify-between">
    <dt className="text-gray-600">Shipping</dt>
    <dd>₹5</dd>
  </div> */}

  <div className="flex items-center justify-between">
    <dt className="text-gray-600">Discount </dt>
    <dd className="text-green-600 font-medium">
      -₹{totalDiscount.toFixed(2)}
    </dd>
  </div>

  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
    <dt className="text-base">Total</dt>
    <dd className="text-base">
      ₹{Math.round(total - totalDiscount )}
    </dd>
  </div>
</dl>


 <div className="border-t pt-6 flex justify-end">
      <button
        type="button"
        onClick={makePurchase}
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-10 py-3 rounded-lg transition disabled:bg-gray-400"
      >
        {isSubmitting ? "Processing Order..." : "Place Order"}
      </button>
    </div>

          </div>
        </section>

        <form className="px-4 pt-10 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0">
  <div className="mx-auto max-w-lg lg:max-w-none space-y-10">
    {/* 🧍 Contact Information */}
    <section
      aria-labelledby="contact-info-heading"
      className="bg-white rounded-xl shadow p-6 border border-gray-100"
    >
      <h2
        id="contact-info-heading"
        className="text-xl font-semibold text-gray-800 mb-5 border-b pb-2"
      >
        Contact Information
      </h2>

      {/* First Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="name-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            value={checkoutForm.name}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, name: e.target.value })
            }
            type="text"
            id="name-input"
            name="name-input"
            autoComplete="given-name"
            required
            disabled={isSubmitting}
            placeholder="John"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastname-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            value={checkoutForm.lastname}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, lastname: e.target.value })
            }
            type="text"
            id="lastname-input"
            name="lastname-input"
            autoComplete="family-name"
            required
            disabled={isSubmitting}
            placeholder="Doe"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div>
          <label
            htmlFor="phone-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            value={checkoutForm.phone}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, phone: e.target.value })
            }
            type="tel"
            id="phone-input"
            name="phone-input"
            autoComplete="tel"
            required
            disabled={isSubmitting}
            placeholder="e.g. 9876543210"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="email-address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            value={checkoutForm.email}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, email: e.target.value })
            }
            type="email"
            id="email-address"
            name="email-address"
            autoComplete="email"
            required
            disabled={isSubmitting}
            placeholder="you@example.com"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </section>

    {/* 💳 Payment Info */}
    <section className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
      <div className="p-2 bg-blue-100 rounded-full">
        <svg
          className="h-5 w-5 text-blue-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-blue-800">
          Payment Information
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Payment will be processed after order confirmation. You’ll be contacted
          for details.
        </p>
      </div>

    </section>

    {/* 📦 Shipping Address */}
    <section
      aria-labelledby="shipping-heading"
      className="bg-white rounded-xl shadow p-6 border border-gray-100"
    >
      <h2
        id="shipping-heading"
        className="text-xl font-semibold text-gray-800 mb-5 border-b pb-2"
      >
        Shipping Address
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Company */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={checkoutForm.company}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, company: e.target.value })
            }
            disabled={isSubmitting}
            placeholder="Your company (optional)"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={checkoutForm.adress}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, adress: e.target.value })
            }
            disabled={isSubmitting}
            placeholder="123 Main Street"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Apartment */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apartment / Suite
          </label>
          <input
            type="text"
            value={checkoutForm.apartment}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, apartment: e.target.value })
            }
            disabled={isSubmitting}
            placeholder="Apt 3B"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={checkoutForm.city}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, city: e.target.value })
            }
            disabled={isSubmitting}
            placeholder="e.g. New Delhi"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            value={checkoutForm.country}
            onChange={(e) =>
              setCheckoutForm({ ...checkoutForm, country: e.target.value })
            }
            disabled={isSubmitting}
            placeholder="e.g. India"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            value={checkoutForm.postalCode}
            onChange={(e) =>
              setCheckoutForm({
                ...checkoutForm,
                postalCode: e.target.value,
              })
            }
            disabled={isSubmitting}
            placeholder="e.g. 110001"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Order Note */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Note
          </label>
          <textarea
            value={checkoutForm.orderNotice}
            onChange={(e) =>
              setCheckoutForm({
                ...checkoutForm,
                orderNotice: e.target.value,
              })
            }
            disabled={isSubmitting}
            placeholder="Add delivery instructions or notes"
            className="block w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>
    </section>

    {/* 🟡 Submit Button */}
   
  </div>
</form>

      </main>
    </div>
  );
};

export default CheckoutPage;
