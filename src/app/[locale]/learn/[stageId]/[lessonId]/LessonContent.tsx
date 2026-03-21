"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import curriculum from "@/data/curriculum.json";
import { getExercisesByLesson } from "@/lib/exercises";
import { Locale } from "@/types";
import { getProgress, saveProgress } from "@/lib/storage/db";
import ExerciseCard from "@/components/exercise/ExerciseCard";

interface Props {
  stageId: string;
  lessonId: string;
}

export default function LessonContent({ stageId, lessonId }: Props) {
  const { t, locale } = useTranslation();
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());

  const stage = curriculum.stages.find((s) => s.id === stageId);
  const lesson = stage?.lessons.find((l) => l.id === lessonId);
  const exercises = getExercisesByLesson(stageId, lessonId);

  // Load existing progress on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const progress = await getProgress(stageId, lessonId);
        if (progress) {
          setCompletedSet(new Set(progress.completedExercises));
        }
      } catch {
        // IndexedDB may not be available
      }
    }
    loadProgress();
  }, [stageId, lessonId]);

  const handleExerciseComplete = useCallback(
    async (exerciseId: string, correct: boolean) => {
      if (!correct) return;

      setCompletedSet((prev) => {
        const next = new Set(prev);
        next.add(exerciseId);

        // Save progress async
        const completedExercises = Array.from(next);
        const completionRate =
          exercises.length > 0
            ? completedExercises.length / exercises.length
            : 0;

        saveProgress({
          lessonId,
          stageId,
          status: completionRate >= 1 ? "completed" : "in-progress",
          completedExercises,
          totalExercises: exercises.length,
          completionRate,
          lastAccessedAt: Date.now(),
          timeSpentSeconds: 0,
        }).catch(() => {});

        return next;
      });
    },
    [stageId, lessonId, exercises.length]
  );

  if (!stage || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-gray-500">
          {locale === "zh" ? "课程不存在" : "Lesson not found"}
        </p>
        <Link
          href={`/${locale}`}
          className="mt-4 text-indigo-600 hover:underline"
        >
          {t("common.back")}
        </Link>
      </div>
    );
  }

  // Find prev/next lessons
  const allLessons = curriculum.stages.flatMap((s) =>
    s.lessons.map((l) => ({ stageId: s.id, ...l }))
  );
  const currentIndex = allLessons.findIndex(
    (l) => l.stageId === stageId && l.id === lessonId
  );
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const completionRate =
    exercises.length > 0 ? completedSet.size / exercises.length : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href={`/${locale}`} className="hover:text-gray-700">
          {t("common.home")}
        </Link>
        <span className="mx-2">/</span>
        <span>{stage.title[locale as Locale]}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">
          {lesson.title[locale as Locale]}
        </span>
      </nav>

      {/* Lesson header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {lesson.title[locale as Locale]}
        </h1>
        <p className="text-gray-600">
          {lesson.description[locale as Locale]}
        </p>
        {lesson.estimatedMinutes && (
          <p className="mt-2 text-sm text-gray-400">
            {locale === "zh"
              ? `预计 ${lesson.estimatedMinutes} 分钟`
              : `Estimated ${lesson.estimatedMinutes} minutes`}
          </p>
        )}
      </div>

      {/* Progress bar */}
      {exercises.length > 0 && (
        <div className="mb-6">
          <div className="mb-1 flex items-center justify-between text-sm text-gray-500">
            <span>
              {locale === "zh" ? "完成进度" : "Progress"}
            </span>
            <span>
              {completedSet.size} / {exercises.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${completionRate * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Exercises */}
      {exercises.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {t("common.exercise")} ({exercises.length})
          </h2>
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index + 1}
              onExerciseComplete={handleExerciseComplete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-400">
          {locale === "zh"
            ? "习题即将推出，敬请期待..."
            : "Exercises coming soon..."}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
        {prevLesson ? (
          <Link
            href={`/${locale}/learn/${prevLesson.stageId}/${prevLesson.id}`}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <span>&larr;</span>
            <span>{prevLesson.title[locale as Locale]}</span>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/${locale}/learn/${nextLesson.stageId}/${nextLesson.id}`}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <span>{nextLesson.title[locale as Locale]}</span>
            <span>&rarr;</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
