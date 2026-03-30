"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { TrueFalseExercise } from "@/types";

interface Props {
  exercise: TrueFalseExercise;
  onResult: (correct: boolean, userAnswer?: unknown) => void;
  savedAnswer?: boolean;
}

export default function TrueFalse({ exercise, onResult, savedAnswer }: Props) {
  const { locale } = useTranslation();
  const restoredFromSave = savedAnswer !== undefined;
  const [selected, setSelected] = useState<boolean | null>(restoredFromSave ? savedAnswer : null);
  const [submitted, setSubmitted] = useState(restoredFromSave);
  const [isCorrect, setIsCorrect] = useState(restoredFromSave ? savedAnswer === exercise.correctAnswer : false);

  function handleSelect(value: boolean) {
    if (submitted && isCorrect) return;
    const correct = value === exercise.correctAnswer;
    setSelected(value);
    setSubmitted(true);
    setIsCorrect(correct);
    onResult(correct, value);
  }

  const locked = submitted && isCorrect;
  const trueLabel = locale === "zh" ? "正确" : "True";
  const falseLabel = locale === "zh" ? "错误" : "False";

  return (
    <div>
      <div className="flex gap-4">
        <button
          onClick={() => handleSelect(true)}
          disabled={locked}
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
          disabled={locked}
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
      {submitted && !isCorrect && (
        <p className="mt-2 text-sm text-gray-500">
          {locale === "zh" ? "答案不对，再试一次吧" : "Wrong answer, try again"}
        </p>
      )}
    </div>
  );
}
