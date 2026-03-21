"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n/context";
import {
  getDueReviewCards,
  getAllReviewCards,
  saveReviewCard,
} from "@/lib/storage/db";
import { sm2Update, autoGradeQuality } from "@/lib/spaced-repetition/sm2";
import { getExerciseById } from "@/lib/exercises";
import { ReviewCard, Exercise } from "@/types";
import ExerciseCard from "@/components/exercise/ExerciseCard";

interface ReviewItem {
  card: ReviewCard;
  exercise: Exercise;
}

type TabType = "due" | "all";

export default function ReviewPage() {
  const { t, locale } = useTranslation();
  const [tab, setTab] = useState<TabType>("due");
  const [dueItems, setDueItems] = useState<ReviewItem[]>([]);
  const [allItems, setAllItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const loadReviews = useCallback(async () => {
    try {
      const [dueCards, allCards] = await Promise.all([
        getDueReviewCards(),
        getAllReviewCards(),
      ]);

      const toItems = (cards: ReviewCard[]): ReviewItem[] => {
        const items: ReviewItem[] = [];
        for (const card of cards) {
          const exercise = getExerciseById(card.exerciseId);
          if (exercise) {
            items.push({ card, exercise });
          }
        }
        return items;
      };

      const due = toItems(dueCards);
      due.sort((a, b) => a.card.nextReviewDate - b.card.nextReviewDate);

      const all = toItems(allCards);
      all.sort((a, b) => b.card.wrongCount - a.card.wrongCount);

      setDueItems(due);
      setAllItems(all);
    } catch {
      // IndexedDB may not be available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleExerciseComplete = useCallback(
    async (_exerciseId: string, correct: boolean) => {
      if (currentIndex >= dueItems.length) return;

      const item = dueItems[currentIndex];
      const quality = autoGradeQuality(correct, 0, 30);
      const updatedCard = sm2Update(item.card, quality);

      try {
        await saveReviewCard(updatedCard);
      } catch {
        // ignore
      }

      if (correct) setCorrectCount((c) => c + 1);

      setTimeout(() => {
        if (currentIndex + 1 >= dueItems.length) {
          setCompleted(true);
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 1500);
    },
    [currentIndex, dueItems]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center text-gray-400">
        {locale === "zh" ? "加载中..." : "Loading..."}
      </div>
    );
  }

  const tabLabels = {
    due: {
      zh: `待复习 (${dueItems.length})`,
      en: `Due (${dueItems.length})`,
    },
    all: {
      zh: `全部错题 (${allItems.length})`,
      en: `All Wrong (${allItems.length})`,
    },
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        {t("review.title")}
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
        {(["due", "all"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setCurrentIndex(0);
              setCompleted(false);
              setCorrectCount(0);
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tabLabels[t][locale === "zh" ? "zh" : "en"]}
          </button>
        ))}
      </div>

      {/* Due tab */}
      {tab === "due" && (
        <>
          {dueItems.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="mb-4 text-5xl">🎉</div>
              <p className="text-lg text-gray-500">
                {t("review.noReviewDue")}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {locale === "zh"
                  ? "答错的题目会自动加入错题集，可立即复习"
                  : "Wrong answers are automatically added for immediate review"}
              </p>
            </div>
          ) : completed ? (
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-16 text-center">
              <div className="mb-4 text-5xl">🎉</div>
              <p className="text-xl font-bold text-green-700">
                {t("review.reviewComplete")}
              </p>
              <p className="mt-4 text-gray-600">
                {locale === "zh"
                  ? `复习了 ${dueItems.length} 道题，正确 ${correctCount} 道`
                  : `Reviewed ${dueItems.length} exercises, ${correctCount} correct`}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                  {currentIndex + 1} / {dueItems.length}
                </span>
              </div>
              <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{
                    width: `${((currentIndex + 1) / dueItems.length) * 100}%`,
                  }}
                />
              </div>
              <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
                {locale === "zh"
                  ? `这道题你之前答错了 ${dueItems[currentIndex].card.wrongCount} 次`
                  : `You got this wrong ${dueItems[currentIndex].card.wrongCount} time(s) before`}
              </div>
              <ExerciseCard
                key={`review-${dueItems[currentIndex].exercise.id}-${currentIndex}`}
                exercise={dueItems[currentIndex].exercise}
                index={currentIndex + 1}
                onExerciseComplete={handleExerciseComplete}
              />
            </>
          )}
        </>
      )}

      {/* All wrong answers tab */}
      {tab === "all" && (
        <>
          {allItems.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="mb-4 text-5xl">✨</div>
              <p className="text-lg text-gray-500">
                {locale === "zh"
                  ? "还没有错题记录"
                  : "No wrong answers recorded yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allItems.map((item) => {
                const isDue = item.card.nextReviewDate <= Date.now();
                return (
                  <div
                    key={item.card.exerciseId}
                    className={`rounded-xl border-2 p-4 ${
                      isDue
                        ? "border-amber-200 bg-amber-50/30"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.exercise.title[locale === "zh" ? "zh" : "en"]}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.exercise.description[
                            locale === "zh" ? "zh" : "en"
                          ].slice(0, 80)}
                          ...
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-1">
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          {locale === "zh"
                            ? `错 ${item.card.wrongCount} 次`
                            : `${item.card.wrongCount} wrong`}
                        </span>
                        {isDue && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            {locale === "zh" ? "待复习" : "Due"}
                          </span>
                        )}
                        {!isDue && (
                          <span className="text-xs text-gray-400">
                            {locale === "zh" ? "下次: " : "Next: "}
                            {new Date(
                              item.card.nextReviewDate
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
