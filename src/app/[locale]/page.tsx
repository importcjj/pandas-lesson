"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import curriculum from "@/data/curriculum.json";
import { Locale } from "@/types";

const stageColors = [
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100 text-rose-700" },
];

const stageIcons = ["📗", "📘", "📙", "📕"];

export default function HomePage() {
  const { t, locale } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          <span className="text-5xl sm:text-6xl">🐼</span>
          <br />
          {t("home.title")}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {t("home.subtitle")}
        </p>
      </div>

      {/* Stage Cards */}
      <div className="space-y-6">
        {curriculum.stages.map((stage, index) => {
          const colors = stageColors[index];
          const totalExercises = stage.lessons.length * 5; // approximate

          return (
            <div
              key={stage.id}
              className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-6 transition-shadow hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-3xl">{stageIcons[index]}</span>
                    <div>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.badge}`}
                      >
                        {t("common.stage")} {index + 1}
                      </span>
                      <h2
                        className={`mt-1 text-xl font-bold ${colors.text}`}
                      >
                        {stage.title[locale as Locale]}
                      </h2>
                    </div>
                  </div>
                  <p className="mb-4 text-sm text-gray-600">
                    {stage.description[locale as Locale]}
                  </p>

                  {/* Lesson list */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {stage.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/${locale}/learn/${stage.id}/${lesson.id}`}
                        className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-white hover:text-gray-900"
                      >
                        <span className="text-gray-400">{lesson.order}.</span>
                        <span>{lesson.title[locale as Locale]}</span>
                        {lesson.estimatedMinutes && (
                          <span className="ml-auto text-xs text-gray-400">
                            {lesson.estimatedMinutes}min
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stage footer */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-200/50 pt-4 text-sm text-gray-500">
                <span>
                  {stage.lessons.length}{" "}
                  {locale === "zh" ? "个课程" : "lessons"} ·{" "}
                  ~{totalExercises} {locale === "zh" ? "道习题" : "exercises"}
                </span>
                {index > 0 && (
                  <span className="text-xs">
                    {locale === "zh"
                      ? `需完成上一阶段 ${stage.requiredCompletionRate * 100}%`
                      : `Requires ${stage.requiredCompletionRate * 100}% of previous stage`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
