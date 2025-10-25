"use client";
import React, { useState, useEffect } from "react";
import { FaBell, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import apiClient from "@/lib/api";

interface AdminHeaderProps {
  title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title = "Admin Dashboard" }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // For now, we'll skip notifications since the API requires a userId
        // You can implement this later when you have user authentication
        setNotifications([]);
      } catch (e) {
        console.error("Failed to load notifications", e);
        setNotifications([]);
      }
    };
    loadNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu || showNotifications) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showNotifications]);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[300px]">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search..." 
            className="border-none outline-none bg-transparent w-full text-sm"
          />
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 relative"
          >
            <FaBell size={20} className="text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[300px] max-h-[400px] overflow-auto z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="p-2">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <span className="text-sm font-medium text-gray-900">Admin User</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          
          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] z-50">
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@avyukta.com</p>
              </div>
              <div className="p-2">
                <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                  <FaUser size={16} />
                  Profile
                </button>
                <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                  <FaCog size={16} />
                  Settings
                </button>
                <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 text-sm text-red-600">
                  <FaSignOutAlt size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
