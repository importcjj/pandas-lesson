"use client";

import { useTranslation } from "@/lib/i18n/context";
import { PitfallItem, Locale } from "@/types";

interface Props {
  items: PitfallItem[];
}

export default function PitfallCard({ items }: Props) {
  const { locale, t } = useTranslation();

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-100">
            {item.title[locale as Locale]}
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            {/* Wrong */}
            <div className="p-3 bg-red-50/50">
              <div className="mb-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <span>✕</span> {t("reference.wrong")}
              </div>
              <pre className="mb-1 overflow-x-auto rounded bg-gray-900 px-2 py-1.5 text-xs text-red-300">
                <code>{item.wrong.code}</code>
              </pre>
              <p className="text-xs text-red-600/80">{item.wrong.note[locale as Locale]}</p>
            </div>
            {/* Right */}
            <div className="p-3 bg-green-50/50">
              <div className="mb-1 flex items-center gap-1 text-xs font-medium text-green-600">
                <span>✓</span> {t("reference.right")}
              </div>
              <pre className="mb-1 overflow-x-auto rounded bg-gray-900 px-2 py-1.5 text-xs text-green-300">
                <code>{item.right.code}</code>
              </pre>
              <p className="text-xs text-green-600/80">{item.right.note[locale as Locale]}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
