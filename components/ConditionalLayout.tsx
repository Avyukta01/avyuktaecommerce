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
  
  // Check if current path is an admin page
  const isAdminPage = pathname?.startsWith('/admin');
  
  // If it's an admin page, don't render the main website header/footer
  if (isAdminPage) {
    return <>{children}</>;
  }
  
  // For non-admin pages, render with header and footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default ConditionalLayout;
