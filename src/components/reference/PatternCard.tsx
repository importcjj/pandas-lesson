"use client";

import { useTranslation } from "@/lib/i18n/context";
import { PatternItem, Locale } from "@/types";

interface Props {
  items: PatternItem[];
}

export default function PatternCard({ items }: Props) {
  const { locale } = useTranslation();

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="mb-1 text-sm font-medium text-gray-800">
            {item.title[locale as Locale]}
          </div>
          <pre className="mb-1 overflow-x-auto rounded bg-gray-900 px-3 py-2 text-xs text-gray-100">
            <code>{item.code}</code>
          </pre>
          <p className="text-xs text-gray-500">{item.note[locale as Locale]}</p>
        </div>
      ))}
    </div>
  );
}
