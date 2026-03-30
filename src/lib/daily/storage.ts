"use client";

import { getTodayDateStr } from "./selection";
import { SavedExerciseState } from "@/lib/storage/exercise-state";

/**
 * Daily practice uses a separate localStorage namespace (pandas_daily_)
 * so it doesn't interfere with lesson exercise state.
 * Keys include the date, so they auto-expire (old dates are cleaned up).
 */

const DAILY_PREFIX = "pandas_daily_";

function dailyKey(dateStr: string, exerciseId: string): string {
  return `${DAILY_PREFIX}${dateStr}_${exerciseId}`;
}

export function saveDailyState(
  exerciseId: string,
  isCorrect: boolean,
  userAnswer?: unknown,
  dateStr?: string
): void {
  const date = dateStr ?? getTodayDateStr();
  try {
    const state: SavedExerciseState = { isCorrect, timestamp: Date.now(), userAnswer };
    localStorage.setItem(dailyKey(date, exerciseId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadDailyState(
  exerciseId: string,
  dateStr?: string
): SavedExerciseState | null {
  const date = dateStr ?? getTodayDateStr();
  try {
    const raw = localStorage.getItem(dailyKey(date, exerciseId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDailyState(
  exerciseId: string,
  dateStr?: string
): void {
  const date = dateStr ?? getTodayDateStr();
  try {
    localStorage.removeItem(dailyKey(date, exerciseId));
  } catch {
    // ignore
  }
}

/** Clean up daily entries older than N days */
export function cleanupOldDailyData(keepDays: number = 7): void {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    const cutoffStr = cutoffDate.toISOString().slice(0, 10);

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DAILY_PREFIX)) {
        // Extract date from key: pandas_daily_YYYY-MM-DD_exerciseId
        const dateMatch = key.slice(DAILY_PREFIX.length, DAILY_PREFIX.length + 10);
        if (dateMatch < cutoffStr) {
          keysToRemove.push(key);
        }
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}
