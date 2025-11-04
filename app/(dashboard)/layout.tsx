import { requireAdmin } from "@/utils/adminAuth";
import DashboardSidebar from "@/components/DashboardSidebar";
import AdminHeader from "@/components/AdminHeader";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 xl:ml-[260px]">
        <AdminHeader title="Admin Dashboard" />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
