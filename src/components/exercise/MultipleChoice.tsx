"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { MultipleChoiceExercise, Locale } from "@/types";

interface Props {
  exercise: MultipleChoiceExercise;
  onResult: (correct: boolean) => void;
}

export default function MultipleChoice({ exercise, onResult }: Props) {
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
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              if (!submitted) setSelected(index);
            }}
            disabled={submitted}
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
