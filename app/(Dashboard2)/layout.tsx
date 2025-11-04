import { requireSuperAdmin } from "@/utils/adminAuth";
import AdminDashboardSidebar from "@/components/AdminDashboardSidebar";
import AdminHeader from "@/components/AdminHeader";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminDashboardSidebar />
      <div className="flex-1 xl:ml-[260px]">
        <AdminHeader title="Super Admin Dashboard" />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
