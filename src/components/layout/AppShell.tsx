"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import QuickReference from "@/components/reference/QuickReference";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-lg font-bold text-indigo-600">
                🐼 Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>

      <QuickReference />
    </div>
  );
}
