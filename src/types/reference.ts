import { LocalizedString } from "./i18n";

/** A single API method entry in the cheatsheet */
export interface ApiItem {
  name: string;
  desc: LocalizedString;
  signature: string;
  example: string;
  output?: string;
  params?: ApiParam[];
  tags: string[];
}

export interface ApiParam {
  name: string;
  type: string;
  default?: string;
  desc: LocalizedString;
}

/** A common usage pattern */
export interface PatternItem {
  title: LocalizedString;
  code: string;
  note: LocalizedString;
}

/** A pitfall / confusing concept with wrong vs right comparison */
export interface PitfallItem {
  title: LocalizedString;
  wrong: { code: string; note: LocalizedString };
  right: { code: string; note: LocalizedString };
}

/** A section within a topic */
export type TopicSection =
  | { type: "api-table"; title: LocalizedString; items: ApiItem[] }
  | { type: "patterns"; title: LocalizedString; items: PatternItem[] }
  | { type: "pitfalls"; title: LocalizedString; items: PitfallItem[] };

/** A single topic (chapter) in the cheatsheet */
export interface CheatsheetTopic {
  id: string;
  title: LocalizedString;
  icon: string;
  sections: TopicSection[];
}

/** Root structure of cheatsheet.json */
export interface CheatsheetData {
  topics: CheatsheetTopic[];
}
