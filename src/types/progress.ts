export interface UserProgress {
  id?: number;
  lessonId: string;
  stageId: string;
  status: "not-started" | "in-progress" | "completed";
  completedExercises: string[];
  totalExercises: number;
  completionRate: number;
  lastAccessedAt: number;
  timeSpentSeconds: number;
}

export interface ExerciseAttempt {
  id?: number;
  exerciseId: string;
  timestamp: number;
  correct: boolean;
  userAnswer: string;
  timeSpentSeconds: number;
  hintsUsed: number;
}
