import { Exercise } from "@/types";
import { getExerciseModulesByStage } from "@/lib/exercises";

/**
 * Generate a deterministic daily exercise set.
 * Uses the date string as a seed for reproducible random selection.
 */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function shuffleWithSeed<T>(arr: T[], rand: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export interface DailyConfig {
  /** Number of exercises per stage */
  perStage: number;
}

const DEFAULT_CONFIG: DailyConfig = { perStage: 3 };

/**
 * Get daily exercises for a given date.
 * Picks `perStage` exercises from each of the 4 stages (total = perStage * 4).
 * The selection is deterministic for the same date string.
 */
export function getDailyExercises(
  dateStr: string = getTodayDateStr(),
  config: DailyConfig = DEFAULT_CONFIG
): Exercise[] {
  const seed = dateToSeed(dateStr);
  const rand = seededRandom(seed);
  const stages = ["stage1", "stage2", "stage3", "stage4"];
  const selected: Exercise[] = [];

  for (const stageId of stages) {
    const modules = getExerciseModulesByStage(stageId);
    const allExercises = modules.flatMap((m) => m.exercises);
    const shuffled = shuffleWithSeed(allExercises, rand);
    selected.push(...shuffled.slice(0, config.perStage));
  }

  return selected;
}
