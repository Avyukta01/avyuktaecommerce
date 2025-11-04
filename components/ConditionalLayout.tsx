"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface ConditionalLayoutProps {
  children: ReactNode;
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname();

  //  Check if current path is an admin or super-admin page
  const isAdminPage =
    pathname?.startsWith("/admin") || pathname?.startsWith("/super-admin");

  //  If it's an admin or super-admin page, hide Header/Footer
  if (isAdminPage) {
    return <>{children}</>;
  }

  //  For normal user pages, show header and footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default ConditionalLayout;
