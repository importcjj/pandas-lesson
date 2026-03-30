"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { usePathname } from "next/navigation";
import { CheatsheetData, CheatsheetTopic, Locale } from "@/types";
import TopicContent from "./TopicContent";
import cheatsheetData from "@/data/reference/cheatsheet.json";

const data = cheatsheetData as unknown as CheatsheetData;

function searchTopics(topics: CheatsheetTopic[], query: string, locale: Locale): CheatsheetTopic[] {
  const q = query.toLowerCase();
  const results: CheatsheetTopic[] = [];
  for (const topic of topics) {
    const filteredSections = topic.sections
      .map((section) => {
        if (section.type === "api-table") {
          const items = section.items.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.desc[locale].toLowerCase().includes(q) ||
              item.signature.toLowerCase().includes(q) ||
              item.example.toLowerCase().includes(q) ||
              item.tags.some((t) => t.toLowerCase().includes(q))
          );
          return items.length > 0 ? { ...section, items } : null;
        }
        if (section.type === "patterns") {
          const items = section.items.filter(
            (item) =>
              item.title[locale].toLowerCase().includes(q) ||
              item.code.toLowerCase().includes(q) ||
              item.note[locale].toLowerCase().includes(q)
          );
          return items.length > 0 ? { ...section, items } : null;
        }
        if (section.type === "pitfalls") {
          const items = section.items.filter(
            (item) =>
              item.title[locale].toLowerCase().includes(q) ||
              item.wrong.code.toLowerCase().includes(q) ||
              item.right.code.toLowerCase().includes(q)
          );
          return items.length > 0 ? { ...section, items } : null;
        }
        return null;
      })
      .filter(Boolean) as CheatsheetTopic["sections"];
    if (filteredSections.length > 0) {
      results.push({ ...topic, sections: filteredSections });
    }
  }
  return results;
}

export default function QuickReference() {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(data.topics[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTopicList, setShowTopicList] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Don't show FAB on the reference page itself
  const isReferencePage = pathname?.includes("/reference");

  const isSearching = searchQuery.trim().length > 0;
  const searchResults = useMemo(
    () => (isSearching ? searchTopics(data.topics, searchQuery.trim(), locale as Locale) : []),
    [searchQuery, locale, isSearching]
  );
  const selectedTopic = data.topics.find((t) => t.id === selectedTopicId);

  // Keyboard shortcut: Ctrl+Shift+K to toggle
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "K") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  const handleTopicClick = useCallback((topicId: string) => {
    setSelectedTopicId(topicId);
    setSearchQuery("");
    setShowTopicList(false);
  }, []);

  if (isReferencePage) return null;

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${
          open
            ? "bg-gray-600 text-white rotate-45"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
        title={locale === "zh" ? "速查表 (Ctrl+Shift+K)" : "Cheat Sheet (Ctrl+Shift+K)"}
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />

          {/* Floating panel */}
          <div
            ref={panelRef}
            className="fixed bottom-24 right-6 z-50 flex h-[70vh] w-[560px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header with search */}
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  📖 {t("reference.title")}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTopicList(!showTopicList)}
                    className={`rounded-md px-2 py-1 text-xs transition-colors ${
                      showTopicList ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {t("reference.topics")}
                  </button>
                  <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] text-gray-400">
                    Ctrl+⇧+K
                  </kbd>
                </div>
              </div>
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setShowTopicList(false);
                  }}
                  placeholder={t("reference.searchPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-8 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
                <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Topic list dropdown */}
            {showTopicList && (
              <div className="shrink-0 max-h-48 overflow-y-auto border-b border-gray-200 bg-gray-50/50 px-2 py-2">
                <div className="grid grid-cols-2 gap-1">
                  {data.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                        selectedTopicId === topic.id && !isSearching
                          ? "bg-indigo-100 text-indigo-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>{topic.icon}</span>
                      <span className="truncate">{topic.title[locale as Locale]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isSearching ? (
                searchResults.length > 0 ? (
                  <div className="space-y-8">
                    {searchResults.map((topic) => (
                      <TopicContent key={topic.id} topic={topic} searchQuery={searchQuery} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-sm">{t("reference.noResults")}</p>
                  </div>
                )
              ) : selectedTopic ? (
                <TopicContent topic={selectedTopic} />
              ) : null}
            </div>
          </div>
        </>
      )}
    </>
  );
}
