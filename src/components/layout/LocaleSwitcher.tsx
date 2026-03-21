"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Locale } from "@/types";

export default function LocaleSwitcher() {
  const { locale } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: Locale) {
    if (newLocale === locale) return;
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    localStorage.setItem("preferred-locale", newLocale);
    router.push(newPath);
  }

  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      <button
        onClick={() => switchLocale("zh")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          locale === "zh"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        中文
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          locale === "en"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}
