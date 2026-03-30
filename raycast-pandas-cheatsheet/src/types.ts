export interface LocalizedString {
  zh: string;
  en: string;
}

export interface ApiParam {
  name: string;
  type: string;
  default?: string;
  desc: LocalizedString;
}

export interface ApiItem {
  name: string;
  desc: LocalizedString;
  signature: string;
  example: string;
  output?: string;
  params?: ApiParam[];
  tags: string[];
}

export interface PatternItem {
  title: LocalizedString;
  code: string;
  note: LocalizedString;
}

export interface PitfallItem {
  title: LocalizedString;
  wrong: { code: string; note: LocalizedString };
  right: { code: string; note: LocalizedString };
}

export type SectionItem = ApiItem | PatternItem | PitfallItem;

export interface TopicSection {
  type: "api-table" | "patterns" | "pitfalls";
  title: LocalizedString;
  items: SectionItem[];
}

export interface CheatsheetTopic {
  id: string;
  title: LocalizedString;
  icon: string;
  sections: TopicSection[];
}

export interface CheatsheetData {
  topics: CheatsheetTopic[];
}
