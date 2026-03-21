"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { getAllExercises } from "@/lib/exercises";
import { Exercise, Locale } from "@/types";
import ExerciseCard from "@/components/exercise/ExerciseCard";
import curriculum from "@/data/curriculum.json";

const typeOptions = [
  { value: "", zh: "所有题型", en: "All Types" },
  { value: "multiple-choice", zh: "选择题", en: "Multiple Choice" },
  { value: "true-false", zh: "判断题", en: "True/False" },
  { value: "fill-blank", zh: "填空题", en: "Fill in Blank" },
  { value: "coding", zh: "编程题", en: "Coding" },
  { value: "output-matching", zh: "输出预测", en: "Output Matching" },
];

const difficultyOptions = [
  { value: 0, zh: "所有难度", en: "All Difficulties" },
  { value: 1, zh: "入门", en: "Beginner" },
  { value: 2, zh: "简单", en: "Easy" },
  { value: 3, zh: "中等", en: "Medium" },
  { value: 4, zh: "困难", en: "Hard" },
  { value: 5, zh: "挑战", en: "Expert" },
];

export default function ExercisesPage() {
  const { t, locale } = useTranslation();
  const [stageFilter, setStageFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState(0);

  const allExercises = useMemo(() => getAllExercises(), []);

  const filtered = useMemo(() => {
    return allExercises.filter((ex) => {
      if (typeFilter && ex.type !== typeFilter) return false;
      if (difficultyFilter && ex.difficulty !== difficultyFilter) return false;
      // Stage filter requires checking exercise ID prefix
      if (stageFilter) {
        const stageNum = stageFilter.replace("stage", "");
        if (!ex.id.startsWith(`s${stageNum}-`)) return false;
      }
      return true;
    });
  }, [allExercises, stageFilter, typeFilter, difficultyFilter]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        {t("common.exercises")}
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow-sm border border-gray-200">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">
            {locale === "zh" ? "所有阶段" : "All Stages"}
          </option>
          {curriculum.stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.title[locale as Locale]}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt[locale as Locale]}
            </option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(Number(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {difficultyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt[locale as Locale]}
            </option>
          ))}
        </select>

        <span className="ml-auto self-center text-sm text-gray-500">
          {filtered.length}{" "}
          {locale === "zh" ? "道习题" : "exercises"}
        </span>
      </div>

      {/* Exercise list */}
      <div className="space-y-6">
        {filtered.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index + 1}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-400">
          {locale === "zh"
            ? "没有匹配的习题"
            : "No matching exercises"}
        </div>
      )}
    </div>
  );
}
