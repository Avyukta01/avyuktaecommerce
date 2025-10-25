"use client";
import React from "react";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string; icon?: React.ReactNode }>;
  children: React.ReactNode;
  loading?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  description,
  breadcrumbs = [],
  children,
  loading = false
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                    {crumb.href ? (
                      <a 
                        href={crumb.href} 
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {crumb.icon}
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-900 font-medium">
                        {crumb.icon}
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Page Header */}
          <div className="mb-6">
            {loading ? (
              <>
                <div className="h-10 bg-gray-200 rounded animate-pulse mb-2 w-80"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-96"></div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                {description && (
                  <p className="text-gray-600">{description}</p>
                )}
              </>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="p-6">
                <div className="h-72 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;