"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { MultipleChoiceExercise, Locale } from "@/types";

interface Props {
  exercise: MultipleChoiceExercise;
  onResult: (correct: boolean, userAnswer?: unknown) => void;
  savedAnswer?: number;
}

export default function MultipleChoice({ exercise, onResult, savedAnswer }: Props) {
  const { locale } = useTranslation();
  const restoredFromSave = savedAnswer !== undefined;
  const [selected, setSelected] = useState<number | null>(restoredFromSave ? savedAnswer : null);
  const [submitted, setSubmitted] = useState(restoredFromSave);
  const [isCorrect, setIsCorrect] = useState(restoredFromSave ? savedAnswer === exercise.correctIndex : false);

  const options = exercise.options[locale as Locale];
  const locked = submitted && isCorrect;

  function handleSubmit() {
    if (selected === null) return;
    const correct = selected === exercise.correctIndex;
    setSubmitted(true);
    setIsCorrect(correct);
    onResult(correct, selected);
  }

  function handleRetry() {
    setSelected(null);
    setSubmitted(false);
    setIsCorrect(false);
  }

  return (
    <div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              if (!locked) {
                setSelected(index);
                if (submitted) setSubmitted(false);
              }
            }}
            disabled={locked}
            className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition-colors ${
              submitted
                ? index === exercise.correctIndex
                  ? "border-green-400 bg-green-50 text-green-800"
                  : index === selected
                  ? "border-red-400 bg-red-50 text-red-800"
                  : "border-gray-200 text-gray-500"
                : selected === index
                ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span className="mr-2 font-medium">
              {String.fromCharCode(65 + index)}.
            </span>
            <code>{option}</code>
          </button>
        ))}
      </div>
      {!locked && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {locale === "zh" ? "提交" : "Submit"}
          </button>
          {submitted && !isCorrect && (
            <button
              onClick={handleRetry}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              {locale === "zh" ? "重新选择" : "Try Again"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
