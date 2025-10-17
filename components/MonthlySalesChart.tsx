// *********************
// Role of the component: Monthly sales column chart (UI only)
// Name of the component: MonthlySalesChart.tsx
// *********************

"use client";
import React from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type MonthlySalesChartProps = {
  data?: number[]; // length 12
};

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data }) => {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, height: 280, animations: { enabled: true } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "40%" } },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4 },
    xaxis: { categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], labels: { style: { colors: "#64748b" } } },
    yaxis: { labels: { style: { colors: "#64748b" } } },
    colors: ["#3b82f6"],
    tooltip: { theme: "light" },
  };

  const series = [{ name: "Sales", data: data && data.length === 12 ? data : [120, 380, 160, 290, 150, 170, 280, 90, 200, 360, 260, 80] }];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-semibold text-slate-900">Monthly Sales</p>
      </div>
      <ApexChart options={options} series={series} type="bar" height={280} />
    </div>
  );
};

export default MonthlySalesChart;


