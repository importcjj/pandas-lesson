"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { OutputMatchingExercise, Locale } from "@/types";

interface Props {
  exercise: OutputMatchingExercise;
  onResult: (correct: boolean) => void;
}

export default function OutputMatching({ exercise, onResult }: Props) {
  const { locale } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options = exercise.options[locale as Locale];

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
    onResult(selected === exercise.correctIndex);
  }

  return (
    <div>
      {/* Code display */}
      <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>{exercise.code}</code>
      </pre>

      {/* Options */}
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              if (!submitted) setSelected(index);
            }}
            disabled={submitted}
            className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-colors ${
              submitted
                ? index === exercise.correctIndex
                  ? "border-green-400 bg-green-50"
                  : index === selected
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 text-gray-400"
                : selected === index
                ? "border-indigo-400 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {option}
            </pre>
          </button>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {locale === "zh" ? "提交" : "Submit"}
        </button>
      )}
    </div>
  );
}
