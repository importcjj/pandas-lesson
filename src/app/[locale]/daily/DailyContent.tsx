"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Locale } from "@/types";
import { getDailyExercises, getTodayDateStr } from "@/lib/daily/selection";
import { loadDailyState, cleanupOldDailyData } from "@/lib/daily/storage";
import DailyExerciseCard from "@/components/exercise/DailyExerciseCard";

const stageColors: Record<string, string> = {
  stage1: "bg-green-500",
  stage2: "bg-blue-500",
  stage3: "bg-yellow-500",
  stage4: "bg-red-500",
  stage5: "bg-violet-500",
  stage6: "bg-cyan-500",
};

const stageLabels: Record<string, { zh: string; en: string }> = {
  stage1: { zh: "基础入门", en: "Basics" },
  stage2: { zh: "数据清洗", en: "Cleaning" },
  stage3: { zh: "分析与聚合", en: "Analysis" },
  stage4: { zh: "高级技巧", en: "Advanced" },
  stage5: { zh: "统计与ML", en: "Stats & ML" },
  stage6: { zh: "量化金融", en: "Quant Finance" },
};

export default function DailyContent() {
  const { t, locale } = useTranslation();
  const dateStr = useMemo(() => getTodayDateStr(), []);
  const exercises = useMemo(() => getDailyExercises(dateStr), [dateStr]);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Restore completed state and cleanup old data
  useEffect(() => {
    cleanupOldDailyData(7);
    const restored = new Set<string>();
    for (const ex of exercises) {
      const saved = loadDailyState(ex.id, dateStr);
      if (saved?.isCorrect) {
        restored.add(ex.id);
      }
    }
    setCompletedSet(restored);
    setHydrated(true);
  }, [exercises, dateStr]);

  const handleComplete = useCallback((exerciseId: string, correct: boolean) => {
    if (!correct) return;
    setCompletedSet((prev) => {
      const next = new Set(prev);
      next.add(exerciseId);
      return next;
    });
  }, []);

  const completionRate = exercises.length > 0 ? completedSet.size / exercises.length : 0;
  const allDone = completedSet.size === exercises.length && exercises.length > 0;

  // Group exercises by stage for the progress indicators
  const stageGroups = useMemo(() => {
    const groups: Record<string, typeof exercises> = {};
    for (const ex of exercises) {
      const stageId = ex.id.startsWith("s1-") ? "stage1"
        : ex.id.startsWith("s2-") ? "stage2"
        : ex.id.startsWith("s3-") ? "stage3"
        : "stage4";
      (groups[stageId] ??= []).push(ex);
    }
    return groups;
  }, [exercises]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href={`/${locale}`} className="hover:text-gray-700">{t("common.home")}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{t("common.daily")}</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{t("daily.title")}</h1>
        <p className="text-gray-600">{t("daily.subtitle")}</p>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
          <span>{dateStr}</span>
          <span>{exercises.length} {locale === "zh" ? "道题" : "exercises"}</span>
          <span>{t("daily.refreshTomorrow")}</span>
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {["stage1", "stage2", "stage3", "stage4"].map((stageId) => {
          const stageExercises = stageGroups[stageId] ?? [];
          const stageDone = stageExercises.filter((ex) => completedSet.has(ex.id)).length;
          return (
            <div key={stageId} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <div className={`mx-auto mb-1 h-2 w-2 rounded-full ${stageColors[stageId]}`} />
              <div className="text-xs font-medium text-gray-600">
                {stageLabels[stageId]?.[locale as Locale]}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {stageDone}/{stageExercises.length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-sm text-gray-500">
          <span>{t("daily.todayProgress")}</span>
          <span>{completedSet.size} / {exercises.length}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${completionRate * 100}%` }}
          />
        </div>
      </div>

      {/* All done banner */}
      {hydrated && allDone && (
        <div className="mb-6 rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-lg font-semibold text-green-800">{t("daily.allDone")}</p>
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-6">
        {exercises.map((exercise, index) => (
          <DailyExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index + 1}
            dateStr={dateStr}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </div>
  );
}
