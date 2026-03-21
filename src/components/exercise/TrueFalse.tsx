"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { TrueFalseExercise } from "@/types";

interface Props {
  exercise: TrueFalseExercise;
  onResult: (correct: boolean) => void;
}

export default function TrueFalse({ exercise, onResult }: Props) {
  const { locale } = useTranslation();
  const [selected, setSelected] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSelect(value: boolean) {
    if (submitted) return;
    setSelected(value);
    setSubmitted(true);
    onResult(value === exercise.correctAnswer);
  }

  const trueLabel = locale === "zh" ? "正确" : "True";
  const falseLabel = locale === "zh" ? "错误" : "False";

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleSelect(true)}
        disabled={submitted}
        className={`flex-1 rounded-lg border-2 px-6 py-4 text-center text-lg font-medium transition-colors ${
          submitted
            ? exercise.correctAnswer === true
              ? "border-green-400 bg-green-50 text-green-800"
              : selected === true
              ? "border-red-400 bg-red-50 text-red-800"
              : "border-gray-200 text-gray-500"
            : selected === true
            ? "border-indigo-400 bg-indigo-50 text-indigo-800"
            : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
        }`}
      >
        ✅ {trueLabel}
      </button>
      <button
        onClick={() => handleSelect(false)}
        disabled={submitted}
        className={`flex-1 rounded-lg border-2 px-6 py-4 text-center text-lg font-medium transition-colors ${
          submitted
            ? exercise.correctAnswer === false
              ? "border-green-400 bg-green-50 text-green-800"
              : selected === false
              ? "border-red-400 bg-red-50 text-red-800"
              : "border-gray-200 text-gray-500"
            : selected === false
            ? "border-indigo-400 bg-indigo-50 text-indigo-800"
            : "border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50"
        }`}
      >
        ❌ {falseLabel}
      </button>
    </div>
  );
}
