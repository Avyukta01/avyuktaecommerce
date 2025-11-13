"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";

interface Product {
  id: string;
  title: string;
  mainImage: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  dateTime: string;
  city: string;
  country: string;
  products: Product[];
}

function beautifyStatus(status: string) {
  const map: Record<string, string> = {
    pending: "Pending ⏳",
    processing: "Packed 📦",
    shipped: "On The Way 🚚",
    delivered: "Delivered ✅",
    cancelled: "Cancelled ❌",
  };
  return map[status] || status;
}

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

export default function OrderStatusPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!session?.user?.email) return;
    try {
      const response = await apiClient.get("/api/orders");
      const data = await response.json();

      if (Array.isArray(data.orders)) {
        const userOrders = data.orders.filter(
          (o: any) => o.email === session.user?.email
        );

        const formattedOrders = userOrders.map((o: any) => ({
          id: o.id,
          status: o.status,
          total: o.total,
          dateTime: o.dateTime,
          city: o.adress,
          country: o.company || "",
          products: o.products || [],
        }));

        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      toast.error("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const getStatusIndex = (status: string) =>
    STATUS_STEPS.indexOf(status.toLowerCase()) !== -1
      ? STATUS_STEPS.indexOf(status.toLowerCase())
      : 0;

  const activeOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  );
  const pastOrders = orders.filter(
    (order) => order.status === "delivered" || order.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-6 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900 text-center">
        Your Orders
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-600 text-center">No orders found.</p>
      ) : (
        <div className="w-full max-w-6xl space-y-16">
          {/* 🟢 ACTIVE ORDERS */}
          {activeOrders.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-l-4 border-green-600 pl-3">
                Active Orders
              </h2>

              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expandedOrder={expandedOrder}
                  setExpandedOrder={setExpandedOrder}
                />
              ))}
            </section>
          )}

          {/* 🟣 PAST ORDERS */}
          {pastOrders.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-l-4 border-gray-400 pl-3">
                Past Orders
              </h2>

              {pastOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expandedOrder={expandedOrder}
                  setExpandedOrder={setExpandedOrder}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/* 💡 Reusable OrderCard Component */
function OrderCard({
  order,
  expandedOrder,
  setExpandedOrder,
}: {
  order: Order;
  expandedOrder: string | null;
  setExpandedOrder: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const getStatusIndex = (status: string) =>
    STATUS_STEPS.indexOf(status.toLowerCase()) !== -1
      ? STATUS_STEPS.indexOf(status.toLowerCase())
      : 0;

  return (
    <div className="bg-white/80 rounded-2xl shadow-md p-6 mb-6 border border-gray-200 transition hover:shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Order #{order.id.slice(0, 8)}...
          </h3>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.dateTime).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p
            className={`font-semibold ${
              order.status === "delivered"
                ? "text-green-600"
                : order.status === "cancelled"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {beautifyStatus(order.status)}
          </p>
          <p className="text-gray-700 text-sm">
            ₹{order.total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() =>
            setExpandedOrder(expandedOrder === order.id ? null : order.id)
          }
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {expandedOrder === order.id ? "Hide Details" : "View Details"}
        </button>
      </div>

      {expandedOrder === order.id && (
        <div className="mt-8 border-t pt-6 transition-all duration-500">
          {/* Progress Bar */}
          <div className="flex justify-between mb-8 relative">
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= getStatusIndex(order.status);
              return (
                <div
                  key={index}
                  className="flex flex-col items-center relative w-1/4"
                >
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-[3px] ${
                        isActive ? "bg-green-500" : "bg-gray-300"
                      } -translate-x-1/2 z-0`}
                    ></div>
                  )}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white z-10 ${
                      isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      isActive ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {beautifyStatus(step)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Product Table */}
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Ordered Products
          </h4>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-center">Qty</th>
                  <th className="px-4 py-2 text-center">Price</th>
                  <th className="px-4 py-2 text-center">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((p, i) => (
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Image
                        src={
                          p.mainImage?.startsWith("http")
                            ? p.mainImage
                            : `/uploads/${p.mainImage}`
                        }
                        alt={p.title}
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                      />
                      <span className="font-medium">{p.title}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{p.quantity}</td>
                    <td className="px-4 py-3 text-center">
                      ₹{p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-blue-700">
                      ₹{(p.price * p.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right font-semibold"
                  >
                    Total:
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-green-700 text-lg">
                    ₹
                    {order.products
                      .reduce((acc, p) => acc + p.price * p.quantity, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Address */}
          <div className="mt-6 border-t pt-4 text-gray-700">
            <div className="flex justify-between">
              <span>Shipping Address:</span>
              <span className="text-right">
                {order.city}, {order.country}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
