"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { CheatsheetData, CheatsheetTopic, Locale } from "@/types";
import TopicContent from "@/components/reference/TopicContent";
import cheatsheetData from "@/data/reference/cheatsheet.json";

const data = cheatsheetData as unknown as CheatsheetData;

/** Search all topics and return matching ones with filtered sections */
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
              item.right.code.toLowerCase().includes(q) ||
              item.wrong.note[locale].toLowerCase().includes(q) ||
              item.right.note[locale].toLowerCase().includes(q)
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

export default function ReferenceContent() {
  const { t, locale } = useTranslation();
  const [selectedTopicId, setSelectedTopicId] = useState(data.topics[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = useMemo(
    () => (isSearching ? searchTopics(data.topics, searchQuery.trim(), locale as Locale) : []),
    [searchQuery, locale, isSearching]
  );

  const selectedTopic = data.topics.find((t) => t.id === selectedTopicId);

  // Keyboard shortcut: Cmd+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchQuery("");
        searchRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTopicClick = useCallback((topicId: string) => {
    setSelectedTopicId(topicId);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Count total items
  const totalItems = useMemo(() => {
    let count = 0;
    for (const topic of data.topics) {
      for (const section of topic.sections) {
        count += section.items.length;
      }
    }
    return count;
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-bold text-gray-900">{t("reference.title")}</h1>
        <p className="text-gray-600">{t("reference.subtitle")}</p>
        <p className="mt-1 text-xs text-gray-400">
          {data.topics.length} {locale === "zh" ? "个主题" : "topics"} · {totalItems} {locale === "zh" ? "条内容" : "entries"}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("reference.searchPlaceholder")}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <svg className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <kbd className="absolute right-3 top-3 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-400">
          ⌘K
        </kbd>
      </div>

      {/* Main content with sidebar */}
      <div className="flex gap-6">
        {/* Left sidebar - topic nav */}
        {!isSearching && (
          <div className="hidden w-48 shrink-0 lg:block">
            <div className="sticky top-20">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                {t("reference.topics")}
              </div>
              <nav className="space-y-0.5">
                {data.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedTopicId === topic.id
                        ? "bg-indigo-50 font-medium text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-base">{topic.icon}</span>
                    <span className="truncate">{topic.title[locale as Locale]}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Right content */}
        <div className="min-w-0 flex-1">
          {/* Mobile topic selector */}
          {!isSearching && (
            <div className="mb-4 lg:hidden">
              <select
                value={selectedTopicId}
                onChange={(e) => handleTopicClick(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {data.topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.icon} {topic.title[locale as Locale]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content: single topic or search results */}
          {isSearching ? (
            searchResults.length > 0 ? (
              <div className="space-y-10">
                {searchResults.map((topic) => (
                  <div key={topic.id}>
                    <TopicContent topic={topic} searchQuery={searchQuery} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400">
                <div className="text-4xl mb-2">🔍</div>
                <p>{t("reference.noResults")}</p>
              </div>
            )
          ) : selectedTopic ? (
            <TopicContent topic={selectedTopic} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
