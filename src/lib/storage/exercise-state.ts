"use client";

/**
 * Persist exercise answer state in localStorage using a hash of exercise content.
 * This ensures answers survive page refreshes but reset if the exercise changes.
 */

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return 'ex_' + (hash >>> 0).toString(36);
}

export function getExerciseHash(exercise: { id: string; title?: Record<string, string>; description?: Record<string, string> }): string {
  const content = exercise.id + JSON.stringify(exercise.description ?? '') + JSON.stringify(exercise.title ?? '');
  return hashString(content);
}

export interface SavedExerciseState {
  isCorrect: boolean;
  timestamp: number;
  /** User's answer data - varies by exercise type */
  userAnswer?: unknown;
}

const STORAGE_PREFIX = 'pandas_ex_';

export function saveExerciseState(hash: string, isCorrect: boolean, userAnswer?: unknown): void {
  try {
    const state: SavedExerciseState = { isCorrect, timestamp: Date.now(), userAnswer };
    localStorage.setItem(STORAGE_PREFIX + hash, JSON.stringify(state));
  } catch {
    // localStorage may not be available
  }
}

export function loadExerciseState(hash: string): SavedExerciseState | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + hash);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearExerciseState(hash: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + hash);
  } catch {
    // ignore
  }
}
