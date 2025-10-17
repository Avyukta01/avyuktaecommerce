"use client";
import { DashboardSidebar } from "@/components";
import React, { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import MonthlySalesChart from "@/components/MonthlySalesChart";
import TargetGauge from "@/components/TargetGauge";
import { FaUserFriends } from "react-icons/fa";
import { FaBox } from "react-icons/fa6";
import { MdAttachMoney } from "react-icons/md";
import apiClient from "@/lib/api";

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ customers: number; orders: number; revenue: number; monthlySales: number[]; targetPercent: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/api/admin/stats`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return (
    <div className="bg-slate-50 flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex w-full flex-col gap-y-5 px-5 py-6 max-xl:ml-0 max-xl:px-4">
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-1">
          <DashboardCard title="Customers" value={stats?.customers ?? "-"} trendLabel={undefined} trendType="neutral" icon={<FaUserFriends />} />
          <DashboardCard title="Orders" value={stats?.orders ?? "-"} trendLabel={undefined} trendType="neutral" icon={<FaBox />} />
          <DashboardCard title="Revenue" value={stats ? `$${(stats.revenue/100).toLocaleString()}` : "-"} trendLabel={undefined} trendType="neutral" icon={<MdAttachMoney />} />
        </div>
        <div className="grid grid-cols-3 gap-5 max-xl:grid-cols-1">
          <div className="col-span-2 max-xl:col-span-1">
            <MonthlySalesChart data={stats?.monthlySales} />
          </div>
          <div>
            <TargetGauge percent={stats?.targetPercent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
