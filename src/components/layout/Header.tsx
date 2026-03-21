"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { getDueReviewCards } from "@/lib/storage/db";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header({
  onToggleMobileMenu,
}: {
  onToggleMobileMenu?: () => void;
}) {
  const { t, locale } = useTranslation();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    async function loadDueCount() {
      try {
        const cards = await getDueReviewCards();
        setDueCount(cards.length);
      } catch {
        // IndexedDB may not be available
      }
    }
    loadDueCount();
    const interval = setInterval(loadDueCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleMobileMenu}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-xl font-bold text-indigo-600"
          >
            <span className="text-2xl">🐼</span>
            <span className="hidden sm:inline">{t("common.appName")}</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${locale}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t("common.home")}
          </Link>
          <Link
            href={`/${locale}/exercises`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t("common.exercises")}
          </Link>
          <Link
            href={`/${locale}/review`}
            className="relative text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t("common.review")}
            {dueCount > 0 && (
              <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {dueCount}
              </span>
            )}
          </Link>
          <Link
            href={`/${locale}/progress`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t("common.progress")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
