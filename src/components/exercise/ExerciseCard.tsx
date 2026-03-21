"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Exercise, Locale } from "@/types";
import { saveAttempt, getReviewCard, saveReviewCard } from "@/lib/storage/db";
import { createReviewCard } from "@/lib/spaced-repetition/sm2";
import MultipleChoice from "./MultipleChoice";
import TrueFalse from "./TrueFalse";
import FillInBlank from "./FillInBlank";
import CodingExercise from "./CodingExercise";
import OutputMatching from "./OutputMatching";

const difficultyLabels: Record<number, { zh: string; en: string }> = {
  1: { zh: "入门", en: "Beginner" },
  2: { zh: "简单", en: "Easy" },
  3: { zh: "中等", en: "Medium" },
  4: { zh: "困难", en: "Hard" },
  5: { zh: "挑战", en: "Expert" },
};

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 text-green-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};

const typeLabels: Record<string, { zh: string; en: string }> = {
  "multiple-choice": { zh: "选择题", en: "Multiple Choice" },
  "true-false": { zh: "判断题", en: "True/False" },
  "fill-blank": { zh: "填空题", en: "Fill in Blank" },
  coding: { zh: "编程题", en: "Coding" },
  "output-matching": { zh: "输出预测", en: "Output Matching" },
};

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onExerciseComplete?: (exerciseId: string, correct: boolean) => void;
}

export default function ExerciseCard({
  exercise,
  index,
  onExerciseComplete,
}: ExerciseCardProps) {
  const { locale } = useTranslation();
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHints, setShowHints] = useState(0);
  const startTimeRef = useRef(Date.now());

  const hints = exercise.hints?.[locale as Locale] ?? [];
  const maxHints = hints.length;

  const handleResult = useCallback(
    async (correct: boolean) => {
      setIsCorrect(correct);

      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

      // Save attempt to IndexedDB
      try {
        await saveAttempt({
          exerciseId: exercise.id,
          timestamp: Date.now(),
          correct,
          userAnswer: "",
          timeSpentSeconds: timeSpent,
          hintsUsed: showHints,
        });

        // If wrong, create/update review card
        if (!correct) {
          const existing = await getReviewCard(exercise.id);
          if (existing) {
            await saveReviewCard({
              ...existing,
              wrongCount: existing.wrongCount + 1,
              lastWrongAnswer: "",
              repetitions: 0,
              interval: 1,
              nextReviewDate: Date.now(), // immediately available for review
            });
          } else {
            const card = createReviewCard(exercise.id, "");
            await saveReviewCard(card);
          }
        }
      } catch {
        // IndexedDB may not be available (e.g. private browsing)
      }

      onExerciseComplete?.(exercise.id, correct);
    },
    [exercise.id, showHints, onExerciseComplete]
  );

  function handleShowHint() {
    if (showHints < maxHints) {
      setShowHints(showHints + 1);
    }
  }

  function handleReset() {
    setIsCorrect(null);
    setShowHints(0);
    startTimeRef.current = Date.now();
  }

  return (
    <div
      className={`rounded-xl border-2 bg-white p-6 transition-colors ${
        isCorrect === true
          ? "border-green-300 bg-green-50/30"
          : isCorrect === false
          ? "border-red-300 bg-red-50/30"
          : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {index}
          </span>
          <h3 className="font-semibold text-gray-900">
            {exercise.title[locale as Locale]}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              difficultyColors[exercise.difficulty]
            }`}
          >
            {difficultyLabels[exercise.difficulty]?.[locale as Locale]}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {typeLabels[exercise.type]?.[locale as Locale]}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 text-gray-700">
        {exercise.description[locale as Locale]}
      </p>

      {/* Exercise component */}
      <div className="mb-4">
        {exercise.type === "multiple-choice" && (
          <MultipleChoice exercise={exercise} onResult={handleResult} />
        )}
        {exercise.type === "true-false" && (
          <TrueFalse exercise={exercise} onResult={handleResult} />
        )}
        {exercise.type === "fill-blank" && (
          <FillInBlank exercise={exercise} onResult={handleResult} />
        )}
        {exercise.type === "coding" && (
          <CodingExercise exercise={exercise} onResult={handleResult} />
        )}
        {exercise.type === "output-matching" && (
          <OutputMatching exercise={exercise} onResult={handleResult} />
        )}
      </div>

      {/* Hints */}
      {maxHints > 0 && isCorrect !== true && (
        <div className="mb-4">
          {showHints > 0 && (
            <div className="mb-2 space-y-1">
              {hints.slice(0, showHints).map((hint, i) => (
                <div
                  key={i}
                  className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
                >
                  💡 {hint}
                </div>
              ))}
            </div>
          )}
          {showHints < maxHints && (
            <button
              onClick={handleShowHint}
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              {showHints === 0
                ? locale === "zh"
                  ? "显示提示"
                  : "Show Hint"
                : locale === "zh"
                ? `下一个提示 (${showHints}/${maxHints})`
                : `Next Hint (${showHints}/${maxHints})`}
            </button>
          )}
        </div>
      )}

      {/* Result feedback */}
      {isCorrect !== null && (
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-medium ${
              isCorrect ? "text-green-600" : "text-red-600"
            }`}
          >
            {isCorrect
              ? locale === "zh"
                ? "✅ 正确！"
                : "✅ Correct!"
              : locale === "zh"
              ? "❌ 不正确"
              : "❌ Incorrect"}
          </span>
          {!isCorrect && (
            <button
              onClick={handleReset}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
            >
              {locale === "zh" ? "再试一次" : "Try Again"}
            </button>
          )}
        </div>
      )}

      {/* Explanation (show after answering correctly) */}
      {isCorrect === true &&
        "explanation" in exercise &&
        exercise.explanation && (
          <div className="mt-3 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span className="font-medium">
              {locale === "zh" ? "解析：" : "Explanation: "}
            </span>
            {exercise.explanation[locale as Locale]}
          </div>
        )}
    </div>
  );
}
