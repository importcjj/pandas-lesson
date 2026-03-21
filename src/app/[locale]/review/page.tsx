"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { getDueReviewCards, saveReviewCard } from "@/lib/storage/db";
import { sm2Update, autoGradeQuality } from "@/lib/spaced-repetition/sm2";
import { getExerciseById } from "@/lib/exercises";
import { ReviewCard, Exercise } from "@/types";
import ExerciseCard from "@/components/exercise/ExerciseCard";

interface ReviewItem {
  card: ReviewCard;
  exercise: Exercise;
}

export default function ReviewPage() {
  const { t, locale } = useTranslation();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    async function loadReviews() {
      try {
        const cards = await getDueReviewCards();
        const reviewItems: ReviewItem[] = [];
        for (const card of cards) {
          const exercise = getExerciseById(card.exerciseId);
          if (exercise) {
            reviewItems.push({ card, exercise });
          }
        }
        // Sort by most overdue first
        reviewItems.sort(
          (a, b) => a.card.nextReviewDate - b.card.nextReviewDate
        );
        setItems(reviewItems);
      } catch {
        // IndexedDB may not be available
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleExerciseComplete = useCallback(
    async (_exerciseId: string, correct: boolean) => {
      if (currentIndex >= items.length) return;

      const item = items[currentIndex];
      const quality = autoGradeQuality(correct, 0, 30);
      const updatedCard = sm2Update(item.card, quality);

      try {
        await saveReviewCard(updatedCard);
      } catch {
        // ignore
      }

      if (correct) setCorrectCount((c) => c + 1);

      // Move to next after a short delay
      setTimeout(() => {
        if (currentIndex + 1 >= items.length) {
          setCompleted(true);
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 1500);
    },
    [currentIndex, items]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center text-gray-400">
        {locale === "zh" ? "加载中..." : "Loading..."}
      </div>
    );
  }

  // No reviews due
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          {t("review.title")}
        </h1>
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <p className="text-lg text-gray-500">{t("review.noReviewDue")}</p>
          <p className="mt-2 text-sm text-gray-400">
            {locale === "zh"
              ? "答错的题目会自动加入错题集，到期后在这里复习"
              : "Wrong answers are automatically added for review on a spaced schedule"}
          </p>
        </div>
      </div>
    );
  }

  // Review completed
  if (completed) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          {t("review.title")}
        </h1>
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-16 text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <p className="text-xl font-bold text-green-700">
            {t("review.reviewComplete")}
          </p>
          <p className="mt-4 text-gray-600">
            {locale === "zh"
              ? `复习了 ${items.length} 道题，正确 ${correctCount} 道`
              : `Reviewed ${items.length} exercises, ${correctCount} correct`}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {locale === "zh"
              ? "下次复习时间已根据你的表现自动调整"
              : "Next review dates have been adjusted based on your performance"}
          </p>
        </div>
      </div>
    );
  }

  // Active review
  const currentItem = items[currentIndex];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("review.title")}
        </h1>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / items.length) * 100}%`,
          }}
        />
      </div>

      {/* Review info */}
      <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
        {locale === "zh"
          ? `这道题你之前答错了 ${currentItem.card.wrongCount} 次`
          : `You got this wrong ${currentItem.card.wrongCount} time(s) before`}
      </div>

      {/* Exercise */}
      <ExerciseCard
        key={`review-${currentItem.exercise.id}-${currentIndex}`}
        exercise={currentItem.exercise}
        index={currentIndex + 1}
        onExerciseComplete={handleExerciseComplete}
      />
    </div>
  );
}
