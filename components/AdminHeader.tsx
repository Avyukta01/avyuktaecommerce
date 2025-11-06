"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AdminHeaderProps {
  title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title = "Admin Dashboard" }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const user = session?.user;

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => setNotifications([]), []);

  // ✅ Fixed logout (won’t get blocked by click-outside)
  const handleLogout = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowProfileMenu(false);
    toast.success("Logging out...");
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  // ✅ Improved "click outside" logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="bg-white px-6 py-3 border-b text-gray-500">
        Loading user...
      </div>
    );
  }

  const displayName = user?.name || user?.email || "User";

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4" ref={menuRef}>
        {/* Search Bar */}
        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[300px]">
          <svg
            className="w-4 h-4 text-gray-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 relative"
          >
            <FaBell size={20} className="text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[300px] max-h-[400px] overflow-auto z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
              </div>
              <div className="p-2 text-center text-sm text-gray-500 py-8">
                No notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {(displayName?.[0] || "A").toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {displayName}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>

          {showProfileMenu && (
            <div
              className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{user?.email || "N/A"}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  <FaUser size={16} />
                  Profile
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  <FaCog size={16} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 text-sm text-red-600"
                >
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
