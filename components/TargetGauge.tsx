// *********************
// Role of the component: Radial gauge for monthly target (UI only)
// Name of the component: TargetGauge.tsx
// *********************

"use client";
import React from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type TargetGaugeProps = { percent?: number };

const TargetGauge: React.FC<TargetGaugeProps> = ({ percent = 75.55 }) => {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "radialBar", toolbar: { show: false }, animations: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: "58%" },
        track: { background: "#eef2ff" },
        dataLabels: {
          name: { show: false },
          value: { fontSize: "28px", fontWeight: 700, color: "#0f172a", offsetY: 8 },
        },
      },
    },
    colors: ["#6366f1"],
    labels: ["Progress"],
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-base font-semibold text-slate-900">Monthly Target</p>
      <div className="mt-4">
        <ApexChart options={options} series={[percent]} type="radialBar" height={300} />
      </div>
      <p className="mt-3 text-center text-sm text-slate-600">You earn $3287 today, it's higher than last month. Keep up your good work!</p>
    </div>
  );
};

export default TargetGauge;


