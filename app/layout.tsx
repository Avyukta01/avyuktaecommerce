import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import 'svgmap/dist/svgMap.min.css';
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";
<<<<<<< HEAD
import ConditionalLayout from "@/components/ConditionalLayout";
=======
>>>>>>> a89075feae2df4122e816472412706b5aad17a94

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Avyukta Ecommerce",
  description: "Avyukta E-commerce is your all-in-one online shopping destination offering premium-quality products at unbeatable prices.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
<<<<<<< HEAD
  const session = await getServerSession(authOptions);
=======
  const session = await getServerSession();
>>>>>>> a89075feae2df4122e816472412706b5aad17a94
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <SessionTimeoutWrapper />
          <ConditionalLayout>
            <Providers>
              {children}
            </Providers>
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
