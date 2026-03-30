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
            href={`/${locale}/daily`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t("common.daily")}
          </Link>
          <Link
            href={`/${locale}/reference`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t("common.reference")}
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
          <a
            href="https://github.com/importcjj/pandas-lesson"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="GitHub"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
