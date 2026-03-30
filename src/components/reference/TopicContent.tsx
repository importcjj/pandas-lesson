"use client";

import { useTranslation } from "@/lib/i18n/context";
import { CheatsheetTopic, Locale } from "@/types";
import ApiTable from "./ApiTable";
import PatternCard from "./PatternCard";
import PitfallCard from "./PitfallCard";

interface Props {
  topic: CheatsheetTopic;
  searchQuery?: string;
}

export default function TopicContent({ topic, searchQuery }: Props) {
  const { locale, t } = useTranslation();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        <span className="mr-2">{topic.icon}</span>
        {topic.title[locale as Locale]}
      </h2>

      <div className="space-y-8">
        {topic.sections.map((section, i) => (
          <div key={i}>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
              {section.type === "api-table" && <span className="text-indigo-500">◆</span>}
              {section.type === "patterns" && <span className="text-amber-500">◆</span>}
              {section.type === "pitfalls" && <span className="text-red-500">◆</span>}
              {section.title[locale as Locale]}
            </h3>

            {section.type === "api-table" && (
              <ApiTable items={section.items} searchQuery={searchQuery} />
            )}
            {section.type === "patterns" && (
              <PatternCard items={section.items} />
            )}
            {section.type === "pitfalls" && (
              <PitfallCard items={section.items} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
