import { List, ActionPanel, Action, Icon, LaunchProps, getPreferenceValues } from "@raycast/api";
import { useState, useMemo } from "react";
import rawData from "./data.json";
import type { CheatsheetData, ApiItem, PatternItem, PitfallItem } from "./types";
import { apiDetailMarkdown, patternDetailMarkdown, pitfallDetailMarkdown } from "./detail";

const data = rawData as unknown as CheatsheetData;
const LANG = (getPreferenceValues<{ language: string }>().language || "zh") as "zh" | "en";

interface SearchableItem {
  topicIcon: string;
  topicTitle: string;
  topicId: string;
  sectionType: "api-table" | "patterns" | "pitfalls";
  item: ApiItem | PatternItem | PitfallItem;
  searchText: string;
}

const allItems: SearchableItem[] = data.topics.flatMap((topic) =>
  topic.sections.flatMap((section) =>
    section.items.map((item) => {
      let searchText = "";
      if (section.type === "api-table") {
        const api = item as ApiItem;
        searchText = [api.name, api.desc[LANG], api.signature, api.example, ...(api.tags || []), ...(api.params?.map((p) => p.name) || [])].join(" ").toLowerCase();
      } else if (section.type === "patterns") {
        const pat = item as PatternItem;
        searchText = [pat.title[LANG], pat.code, pat.note[LANG]].join(" ").toLowerCase();
      } else if (section.type === "pitfalls") {
        const pit = item as PitfallItem;
        searchText = [pit.title[LANG], pit.wrong.code, pit.right.code, pit.wrong.note[LANG], pit.right.note[LANG]].join(" ").toLowerCase();
      }
      return { topicIcon: topic.icon, topicTitle: topic.title[LANG], topicId: topic.id, sectionType: section.type, item, searchText };
    })
  )
);

function getTitle(e: SearchableItem): string {
  if (e.sectionType === "api-table") return (e.item as ApiItem).name;
  if (e.sectionType === "patterns") return (e.item as PatternItem).title[LANG];
  return (e.item as PitfallItem).title[LANG];
}

function getIcon(e: SearchableItem): Icon {
  if (e.sectionType === "api-table") return Icon.Code;
  if (e.sectionType === "patterns") return Icon.LightBulb;
  return Icon.ExclamationMark;
}

function getCopyCode(e: SearchableItem): string {
  if (e.sectionType === "api-table") return (e.item as ApiItem).example;
  if (e.sectionType === "patterns") return (e.item as PatternItem).code;
  return (e.item as PitfallItem).right.code;
}

function getDetailMd(e: SearchableItem): string {
  if (e.sectionType === "api-table") return apiDetailMarkdown(e.item as ApiItem, LANG);
  if (e.sectionType === "patterns") return patternDetailMarkdown(e.item as PatternItem, LANG);
  return pitfallDetailMarkdown(e.item as PitfallItem, LANG);
}

function topicSummaryMd(topicId: string): string {
  const topic = data.topics.find((t) => t.id === topicId);
  if (!topic) return "";
  const lines: string[] = [`# ${topic.icon} ${topic.title[LANG]}`, ""];
  for (const section of topic.sections) {
    const badge = section.type === "api-table" ? "📌" : section.type === "patterns" ? "💡" : "⚠️";
    lines.push(`### ${badge} ${section.title[LANG]}`);
    lines.push("");
    for (const item of section.items) {
      if (section.type === "api-table") {
        lines.push(`- \`${(item as ApiItem).name}\` — ${(item as ApiItem).desc[LANG]}`);
      } else if (section.type === "patterns") {
        lines.push(`- **${(item as PatternItem).title[LANG]}**`);
      } else {
        lines.push(`- **${(item as PitfallItem).title[LANG]}**`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

export default function Command(props: LaunchProps<{ arguments: { query?: string } }>) {
  const initialQuery = props.arguments.query?.trim() || "";
  const [query, setQuery] = useState(initialQuery);

  const isSearching = query.trim().length > 0;

  const filtered = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase();
    return allItems.filter((e) => e.searchText.includes(q));
  }, [query, isSearching]);

  // Group search results by topic
  const grouped = useMemo(() => {
    const map = new Map<string, SearchableItem[]>();
    for (const entry of filtered) {
      const key = `${entry.topicIcon} ${entry.topicTitle}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return map;
  }, [filtered]);

  return (
    <List
      searchBarPlaceholder="输入关键词搜索 API、写法、踩坑..."
      searchText={query}
      onSearchTextChange={setQuery}
      isShowingDetail
      throttle
    >
      {isSearching ? (
        // Search results
        filtered.length === 0 ? (
          <List.EmptyView title="没有找到相关内容" description="试试其他关键词，如 merge、fillna、groupby" icon={Icon.MagnifyingGlass} />
        ) : (
          Array.from(grouped.entries()).map(([groupTitle, entries]) => (
            <List.Section key={groupTitle} title={groupTitle} subtitle={`${entries.length} 条`}>
              {entries.map((entry, i) => (
                <List.Item
                  key={`${groupTitle}-${i}`}
                  icon={getIcon(entry)}
                  title={getTitle(entry)}
                  detail={<List.Item.Detail markdown={getDetailMd(entry)} />}
                  actions={
                    <ActionPanel>
                      <Action.CopyToClipboard title="复制代码" content={getCopyCode(entry)} />
                      <Action.Paste title="粘贴代码" content={getCopyCode(entry)} />
                    </ActionPanel>
                  }
                />
              ))}
            </List.Section>
          ))
        )
      ) : (
        // Directory mode: show all topics
        data.topics.map((topic) => (
          <List.Item
            key={topic.id}
            icon={topic.icon}
            title={topic.title[LANG]}
            accessories={[{ text: `${topic.sections.reduce((s, sec) => s + sec.items.length, 0)}` }]}
            detail={<List.Item.Detail markdown={topicSummaryMd(topic.id)} />}
            actions={
              <ActionPanel>
                <Action title="浏览此主题" icon={Icon.List} onAction={() => setQuery(topic.title[LANG] + " ")} />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
