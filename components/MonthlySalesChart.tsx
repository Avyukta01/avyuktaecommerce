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
  period?: string;
};

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data, period = 'Month' }) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      height: 280,
      animations: { enabled: true },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "45%",
        distributed: false,
      },
    },
    dataLabels: { enabled: false },
    grid: {
      strokeDashArray: 4,
      borderColor: "#e2e8f0",
    },
    xaxis: {
      categories: period === 'Year' 
        ? ["2020", "2021", "2022", "2023", "2024", "2025"]
        : period === 'Day'
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: {
        style: {
          colors: "#475569",
          fontSize: "13px",
          fontWeight: 500,
        },
      },
      axisBorder: { color: "#cbd5e1" },
      axisTicks: { color: "#cbd5e1" },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#475569",
          fontSize: "13px",
        },
      },
    },
    colors: ["#2563eb"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.25,
        gradientToColors: ["#60a5fa"],
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 0.8,
      },
    },
    tooltip: { theme: "light" },
  };

  const getDataForPeriod = () => {
    if (!data) {
      return period === 'Year' 
        ? [1200, 1500, 1800, 2200, 2500, 2800]
        : period === 'Day'
        ? [120, 180, 200, 150, 300, 250, 180]
        : [120, 380, 160, 290, 150, 170, 280, 90, 200, 360, 260, 80];
    }
    
    if (period === 'Year') {
      // Aggregate monthly data into yearly data
      const yearlyData = [];
      for (let i = 0; i < data.length; i += 2) {
        yearlyData.push((data[i] || 0) + (data[i + 1] || 0));
      }
      return yearlyData;
    } else if (period === 'Day') {
      // Convert monthly data to daily data (simplified)
      return data.slice(0, 7).map(value => Math.floor(value / 4));
    }
    
    return data;
  };

  const series = [
    {
      name: period === 'Year' ? "Yearly Sales" : period === 'Day' ? "Daily Sales" : "Monthly Sales",
      data: getDataForPeriod(),
    },
  ];

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))",
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-lg font-semibold text-[#0f172a]">
          {period === 'Year' ? 'Yearly Sales' : period === 'Day' ? 'Daily Sales' : 'Monthly Sales'}
        </p>
        <span className="text-sm font-medium text-slate-500">
          {period === 'Year' ? '2020-2025 Overview' : period === 'Day' ? 'Weekly Overview' : '2025 Overview'}
        </span>
      </div>
      <ApexChart options={options} series={series} type="bar" height={280} />
    </div>
  );
};

export default MonthlySalesChart;
