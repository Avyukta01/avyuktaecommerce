"use client";

"use client";

import { navigation } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
=======
import { Facebook, Twitter, Instagram } from "lucide-react"; // <-- Added icons
>>>>>>> a89075feae2df4122e816472412706b5aad17a94

const Footer = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
<<<<<<< HEAD
=======

>>>>>>> a89075feae2df4122e816472412706b5aad17a94
  return (
    <footer
      className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200"
      aria-labelledby="footer-heading"
    >
      <div>
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Logo and Company Info */}
            <div className="lg:col-span-1">
              <Image
                src="/logo_new.png"
                alt="Company logo"
                width={200}
                height={80}
                className="h-auto w-auto mb-6"
              />
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Your trusted partner for quality electronics and innovative
                technology solutions.
              </p>

              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Facebook size={16} color="white" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
                >
                  <Twitter size={16} color="white" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                >
                  <Instagram size={16} color="white" />
                </a>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:col-span-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Shop
                </h3>
                <ul role="list" className="space-y-3">
                  {navigation.sale.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Company
                </h3>
                <ul role="list" className="space-y-3">
                  {navigation.about.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Support
                </h3>
                <ul role="list" className="space-y-3">
                  {navigation.help.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                © 2024 Your Company. All rights reserved.
              </p>
              <div className="mt-4 sm:mt-0 flex space-x-6">
                <a
                  href="/Privacy"
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/TermsCondition"
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
