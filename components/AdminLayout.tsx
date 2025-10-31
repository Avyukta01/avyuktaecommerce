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
    <div className="xl: w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
    
        <div className="max-w-7xl mx-auto">
          

          {/* Page Header */}
          <div className="pb-6 pt-4 border-b-2 border-gray-200 mb-6">
            {loading ? (
              <>
                <div className="h-10 bg-gray-200 rounded animate-pulse mb-2 w-80"></div>
                <div className="pb-6 pt-4 border-b-2 border-gray-200 mb-6"></div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
             
              </>
            )}
            
          </div>

          {/* Content */}
          <div >
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
  );
};

export default AdminLayout;