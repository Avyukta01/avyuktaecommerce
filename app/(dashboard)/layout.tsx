import { requireAdmin } from "@/utils/adminAuth";
import DashboardSidebar from "@/components/DashboardSidebar";
import AdminHeader from "@/components/AdminHeader";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This function handles all authentication and authorization server-side
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="flex-1 xl:ml-[260px]">
        <AdminHeader title="Admin Dashboard" />
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
