"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { FillBlankExercise } from "@/types";

interface Props {
  exercise: FillBlankExercise;
  onResult: (correct: boolean, userAnswer?: unknown) => void;
  savedAnswers?: string[];
}

export default function FillInBlank({ exercise, onResult, savedAnswers }: Props) {
  const { locale } = useTranslation();

  // Restore saved answers into the answers record
  const initialAnswers: Record<string, string> = {};
  let restoredFromSave = false;
  if (savedAnswers && savedAnswers.length === exercise.blanks.length) {
    restoredFromSave = true;
    exercise.blanks.forEach((blank, i) => {
      initialAnswers[blank.placeholder] = savedAnswers[i];
    });
  }

  // Check if restored answers are all correct
  let restoredCorrect = false;
  const restoredResults: Record<string, boolean> = {};
  if (restoredFromSave) {
    restoredCorrect = true;
    for (const blank of exercise.blanks) {
      const userAnswer = (initialAnswers[blank.placeholder] ?? "").trim();
      const isCorrect = userAnswer === blank.answer || (blank.alternatives?.includes(userAnswer) ?? false);
      restoredResults[blank.placeholder] = isCorrect;
      if (!isCorrect) restoredCorrect = false;
    }
  }

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [submitted, setSubmitted] = useState(restoredFromSave);
  const [allCorrect, setAllCorrect] = useState(restoredCorrect);
  const [results, setResults] = useState<Record<string, boolean>>(restoredFromSave ? restoredResults : {});

  function handleChange(placeholder: string, value: string) {
    setAnswers((prev) => ({ ...prev, [placeholder]: value }));
  }

  function handleSubmit() {
    const newResults: Record<string, boolean> = {};
    let correct = true;

    for (const blank of exercise.blanks) {
      const userAnswer = (answers[blank.placeholder] ?? "").trim();
      const isCorrect =
        userAnswer === blank.answer ||
        (blank.alternatives?.includes(userAnswer) ?? false);
      newResults[blank.placeholder] = isCorrect;
      if (!isCorrect) correct = false;
    }

    setResults(newResults);
    setSubmitted(true);
    setAllCorrect(correct);

    // Save the ordered answers array
    const answerArray = exercise.blanks.map((b) => answers[b.placeholder] ?? "");
    onResult(correct, answerArray);
  }

  function handleRetry() {
    setSubmitted(false);
    setAllCorrect(false);
    setResults({});
  }

  // Only lock inputs when answered correctly
  const inputsLocked = submitted && allCorrect;

  // Render code template with input fields
  const parts = exercise.codeTemplate.split(
    new RegExp(
      `(${exercise.blanks.map((b) => b.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "g"
    )
  );

  return (
    <div>
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>
          {parts.map((part, i) => {
            const blank = exercise.blanks.find((b) => b.placeholder === part);
            if (blank) {
              return (
                <input
                  key={i}
                  type="text"
                  value={answers[blank.placeholder] ?? ""}
                  onChange={(e) =>
                    handleChange(blank.placeholder, e.target.value)
                  }
                  disabled={inputsLocked}
                  placeholder={locale === "zh" ? "填写答案" : "answer"}
                  className={`mx-1 inline-block w-32 rounded border-2 bg-gray-800 px-2 py-0.5 font-mono text-sm ${
                    submitted
                      ? results[blank.placeholder]
                        ? "border-green-500 text-green-400"
                        : "border-red-500 text-red-400"
                      : "border-indigo-500 text-white"
                  }`}
                />
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </code>
      </pre>

      {submitted && !allCorrect && (
        <div className="mt-2 text-sm text-gray-500">
          {locale === "zh" ? "参考答案：" : "Answer: "}
          {exercise.blanks.map((b) => (
            <code key={b.placeholder} className="mx-1 text-green-600">
              {b.answer}
            </code>
          ))}
        </div>
      )}

      {!inputsLocked && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={exercise.blanks.some(
              (b) => !(answers[b.placeholder] ?? "").trim()
            )}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {locale === "zh" ? "提交" : "Submit"}
          </button>
          {submitted && !allCorrect && (
            <button
              onClick={handleRetry}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              {locale === "zh" ? "清除重试" : "Clear & Retry"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
