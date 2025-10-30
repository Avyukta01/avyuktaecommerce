


// *********************
// Role of the component: Generic dashboard stat card UI
// Name of the component: DashboardCard.tsx
// Output: Styled card with title, value, optional trend badge and footer
// *********************

"use client";
import React from "react";

type DashboardCardProps = {
  title: string;
  value: string | number;
  trendLabel?: string; // e.g., +11.01%
  trendType?: "up" | "down" | "neutral";
  footer?: React.ReactNode;
  icon?: React.ReactNode;
};

const trendColorMap: Record<NonNullable<DashboardCardProps["trendType"]>, string> = {
  up: "bg-emerald-100 text-emerald-700",
  down: "bg-rose-100 text-rose-700",
  neutral: "bg-slate-100 text-slate-700",
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  trendLabel,
  trendType = "neutral",
  footer,
  icon,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600">{icon}</div>}
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        </div>
        {trendLabel && (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${trendColorMap[trendType]}`}>
            {trendLabel}
          </span>
        )}
      </div>
      {footer && <div className="mt-4 text-sm text-slate-600">{footer}</div>}
    </div>
  );
};

export default DashboardCard;


