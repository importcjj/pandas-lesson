import { LocalizedString, LocalizedStringArray } from "./i18n";

export type ExerciseType =
  | "multiple-choice"
  | "true-false"
  | "fill-blank"
  | "coding"
  | "output-matching";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface ExerciseBase {
  id: string;
  type: ExerciseType;
  difficulty: Difficulty;
  title: LocalizedString;
  description: LocalizedString;
  hints?: LocalizedStringArray;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: "multiple-choice";
  options: LocalizedStringArray;
  correctIndex: number;
  explanation?: LocalizedString;
}

export interface TrueFalseExercise extends ExerciseBase {
  type: "true-false";
  correctAnswer: boolean;
  explanation?: LocalizedString;
}

export interface FillBlankExercise extends ExerciseBase {
  type: "fill-blank";
  codeTemplate: string;
  blanks: {
    placeholder: string;
    answer: string;
    alternatives?: string[];
  }[];
  explanation?: LocalizedString;
}

export interface CodingExercise extends ExerciseBase {
  type: "coding";
  starterCode: string;
  solutionCode: string;
  setupCode?: string;
  validationType: "exact-output" | "dataframe-equals" | "custom-check";
  expectedOutput?: string;
  checkCode?: string;
}

export interface OutputMatchingExercise extends ExerciseBase {
  type: "output-matching";
  code: string;
  options: LocalizedStringArray;
  correctIndex: number;
  explanation?: LocalizedString;
}

export type Exercise =
  | MultipleChoiceExercise
  | TrueFalseExercise
  | FillBlankExercise
  | CodingExercise
  | OutputMatchingExercise;

export interface ExerciseModule {
  module: string;
  stageId: string;
  lessonId: string;
  tags: string[];
  exercises: Exercise[];
}
