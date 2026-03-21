import { ReviewCard } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * SM-2 spaced repetition algorithm.
 * Quality scale: 0-5
 *   0-2 = incorrect (reset)
 *   3 = correct with difficulty
 *   4 = correct
 *   5 = correct with ease
 */
export function sm2Update(card: ReviewCard, quality: number): ReviewCard {
  const now = Date.now();

  if (quality < 3) {
    // Failed: reset repetitions, review again tomorrow
    return {
      ...card,
      repetitions: 0,
      interval: 1,
      nextReviewDate: now + DAY_MS,
      wrongCount: card.wrongCount + 1,
      lastReviewedAt: now,
    };
  }

  const newReps = card.repetitions + 1;
  let newInterval: number;

  if (newReps === 1) {
    newInterval = 1;
  } else if (newReps === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(card.interval * card.easeFactor);
  }

  const newEF = Math.max(
    1.3,
    card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    ...card,
    repetitions: newReps,
    interval: newInterval,
    easeFactor: newEF,
    nextReviewDate: now + newInterval * DAY_MS,
    lastReviewedAt: now,
  };
}

export function createReviewCard(
  exerciseId: string,
  wrongAnswer: string
): ReviewCard {
  const now = Date.now();
  return {
    exerciseId,
    repetitions: 0,
    easeFactor: 2.5,
    interval: 1,
    nextReviewDate: now + DAY_MS,
    wrongCount: 1,
    lastWrongAnswer: wrongAnswer,
    createdAt: now,
    lastReviewedAt: now,
  };
}

export function isDue(card: ReviewCard): boolean {
  return Date.now() >= card.nextReviewDate;
}

export function isMastered(card: ReviewCard): boolean {
  return card.interval > 180;
}

/**
 * Auto-grade quality based on exercise result.
 * - Wrong: quality = 1
 * - Correct with hints: quality = 3
 * - Correct without hints: quality = 4
 * - Correct quickly (< 30s) without hints: quality = 5
 */
export function autoGradeQuality(
  correct: boolean,
  hintsUsed: number,
  timeSpentSeconds: number
): number {
  if (!correct) return 1;
  if (hintsUsed > 0) return 3;
  if (timeSpentSeconds < 30) return 5;
  return 4;
}
