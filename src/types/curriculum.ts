import { LocalizedString } from "./i18n";

export interface Stage {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  requiredCompletionRate: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  order: number;
  title: LocalizedString;
  description: LocalizedString;
  contentPath?: string;
  exerciseModules: string[];
  estimatedMinutes?: number;
}

export interface Curriculum {
  stages: Stage[];
}
