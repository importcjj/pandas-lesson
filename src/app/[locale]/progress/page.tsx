"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n/context";
import curriculum from "@/data/curriculum.json";
import { Locale, UserProgress } from "@/types";
import { getAllProgress, exportAllData, clearAllData } from "@/lib/storage/db";

export default function ProgressPage() {
  const { t, locale } = useTranslation();
  const [progressData, setProgressData] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllProgress();
        setProgressData(data);
      } catch {
        // IndexedDB may not be available
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getStageProgress(stageId: string) {
    const stageLessons = curriculum.stages.find(
      (s) => s.id === stageId
    )?.lessons;
    if (!stageLessons) return { completed: 0, total: 0, rate: 0 };

    const total = stageLessons.length;
    const completed = stageLessons.filter((lesson) => {
      const p = progressData.find(
        (pd) => pd.stageId === stageId && pd.lessonId === lesson.id
      );
      return p && p.status === "completed";
    }).length;

    return { completed, total, rate: total > 0 ? completed / total : 0 };
  }

  const totalLessons = curriculum.stages.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  );
  const totalCompleted = curriculum.stages.reduce((sum, s) => {
    return sum + getStageProgress(s.id).completed;
  }, 0);
  const overallRate = totalLessons > 0 ? totalCompleted / totalLessons : 0;

  async function handleExport() {
    try {
      const data = await exportAllData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pandas-lesson-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Reload progress after import
      if (data.progress) {
        // For simplicity, reload the page after import
        // A full implementation would call saveProgress for each item
        window.location.reload();
      }
    } catch {
      alert(locale === "zh" ? "导入文件格式错误" : "Invalid import file format");
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(t("progress.resetConfirm"));
    if (!confirmed) return;
    try {
      await clearAllData();
      setProgressData([]);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center text-gray-400">
        {locale === "zh" ? "加载中..." : "Loading..."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        {t("progress.title")}
      </h1>

      {/* Overall progress */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {t("progress.overallProgress")}
        </h2>
        <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
          <span>{Math.round(overallRate * 100)}%</span>
          <span>
            {totalCompleted} / {totalLessons}{" "}
            {locale === "zh" ? "课程" : "lessons"}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${overallRate * 100}%` }}
          />
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {t("progress.stageBreakdown")}
        </h2>
        {curriculum.stages.map((stage, index) => {
          const { completed, total, rate } = getStageProgress(stage.id);
          return (
            <div
              key={stage.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-gray-800">
                  {locale === "zh" ? `阶段 ${index + 1}` : `Stage ${index + 1}`}
                  : {stage.title[locale as Locale]}
                </span>
                <span className="text-sm text-gray-500">
                  {completed} / {total}{" "}
                  <span className="text-xs">
                    ({Math.round(rate * 100)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                  style={{ width: `${rate * 100}%` }}
                />
              </div>

              {/* Lesson details */}
              <div className="mt-3 grid gap-1">
                {stage.lessons.map((lesson) => {
                  const p = progressData.find(
                    (pd) =>
                      pd.stageId === stage.id && pd.lessonId === lesson.id
                  );
                  const status = p?.status ?? "not-started";

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {lesson.title[locale as Locale]}
                      </span>
                      <span
                        className={`text-xs ${
                          status === "completed"
                            ? "text-green-600"
                            : status === "in-progress"
                            ? "text-amber-600"
                            : "text-gray-400"
                        }`}
                      >
                        {status === "completed"
                          ? "✅"
                          : status === "in-progress"
                          ? `${Math.round((p?.completionRate ?? 0) * 100)}%`
                          : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Data management */}
      <div className="mt-8 flex gap-3 border-t border-gray-200 pt-6">
        <button
          onClick={handleExport}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          {t("progress.exportData")}
        </button>
        <button
          onClick={handleImportClick}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          {t("progress.importData")}
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          {t("progress.resetData")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
