"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import curriculum from "@/data/curriculum.json";
import { Locale, UserProgress } from "@/types";
import { getAllProgress } from "@/lib/storage/db";

const stageIcons = ["📗", "📘", "📙", "📕"];

export default function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const { locale } = useTranslation();
  const pathname = usePathname();
  const [progressData, setProgressData] = useState<UserProgress[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllProgress();
        setProgressData(data);
      } catch {
        // ignore
      }
    }
    load();
  }, [pathname]); // Reload when navigating

  function isStageUnlocked(stageIndex: number): boolean {
    if (stageIndex === 0) return true;
    const prevStage = curriculum.stages[stageIndex - 1];
    const prevLessons = prevStage.lessons;
    const completedCount = prevLessons.filter((lesson) => {
      const p = progressData.find(
        (pd) => pd.stageId === prevStage.id && pd.lessonId === lesson.id
      );
      return p && p.status === "completed";
    }).length;
    const rate = prevLessons.length > 0 ? completedCount / prevLessons.length : 0;
    return rate >= prevStage.requiredCompletionRate;
  }

  const containerClass = mobile
    ? "p-4"
    : "hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block";

  return (
    <aside className={containerClass}>
      <nav
        className={
          mobile
            ? ""
            : "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4"
        }
      >
        <div className="space-y-6">
          {curriculum.stages.map((stage, stageIndex) => {
            const unlocked = isStageUnlocked(stageIndex);

            return (
              <div key={stage.id}>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <span>{stageIcons[stageIndex]}</span>
                  <span>{stage.title[locale as Locale]}</span>
                  {!unlocked && <span className="text-gray-300">🔒</span>}
                </h3>
                <ul className="space-y-1">
                  {stage.lessons.map((lesson) => {
                    const href = `/${locale}/learn/${stage.id}/${lesson.id}`;
                    const isActive = pathname === href;
                    const p = progressData.find(
                      (pd) =>
                        pd.stageId === stage.id && pd.lessonId === lesson.id
                    );

                    if (!unlocked) {
                      return (
                        <li key={lesson.id}>
                          <span className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-gray-300">
                            {lesson.title[locale as Locale]}
                          </span>
                        </li>
                      );
                    }

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={href}
                          className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-indigo-50 font-medium text-indigo-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span>{lesson.title[locale as Locale]}</span>
                          {p?.status === "completed" && (
                            <span className="text-xs text-green-500">✅</span>
                          )}
                          {p?.status === "in-progress" && (
                            <span className="text-xs text-amber-500">
                              {Math.round((p.completionRate ?? 0) * 100)}%
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
