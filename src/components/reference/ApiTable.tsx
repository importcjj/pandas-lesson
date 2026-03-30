"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { ApiItem, Locale } from "@/types";

interface Props {
  items: ApiItem[];
  searchQuery?: string;
}

export default function ApiTable({ items, searchQuery }: Props) {
  const { locale, t } = useTranslation();

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <ApiRow key={i} item={item} locale={locale as Locale} t={t} searchQuery={searchQuery} />
      ))}
    </div>
  );
}

function ApiRow({ item, locale, t, searchQuery }: { item: ApiItem; locale: Locale; t: (k: string) => string; searchQuery?: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasParams = item.params && item.params.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => hasParams && setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-bold text-indigo-700">{item.name}</code>
            <span className="text-xs text-gray-500">{item.desc[locale]}</span>
          </div>
          <pre className="mt-1 text-xs text-gray-600 overflow-x-auto">
            <code>{item.signature}</code>
          </pre>
          {/* Compact param summary (always visible) */}
          {hasParams && !expanded && (
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {item.params!.map((p, j) => (
                <span key={j} className="text-[11px] text-gray-400">
                  <code className="text-indigo-500/70">{p.name}</code>
                  {" — "}
                  {p.desc[locale]}
                </span>
              ))}
            </div>
          )}
        </div>
        {hasParams && (
          <button className="shrink-0 mt-1 text-xs text-indigo-500 hover:text-indigo-700">
            {expanded ? "▲" : "▼"}
          </button>
        )}
      </div>

      {/* Example */}
      <div className="border-t border-gray-100 bg-gray-900 px-4 py-2">
        <pre className="text-xs text-gray-100 overflow-x-auto"><code>{item.example}</code></pre>
        {item.output && (
          <pre className="mt-1 text-xs text-green-400 overflow-x-auto"><code>{`# → ${item.output}`}</code></pre>
        )}
      </div>

      {/* Expanded params table */}
      {expanded && hasParams && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-1 pr-3 font-medium">{t("reference.params")}</th>
                <th className="pb-1 pr-3 font-medium">Type</th>
                <th className="pb-1 pr-3 font-medium">Default</th>
                <th className="pb-1 font-medium">{locale === "zh" ? "说明" : "Description"}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {item.params!.map((p, j) => (
                <tr key={j} className="border-t border-gray-200">
                  <td className="py-1.5 pr-3 font-mono text-indigo-600">{p.name}</td>
                  <td className="py-1.5 pr-3 font-mono text-gray-500">{p.type}</td>
                  <td className="py-1.5 pr-3 font-mono text-gray-400">{p.default ?? "—"}</td>
                  <td className="py-1.5">{p.desc[locale]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
