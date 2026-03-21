export interface ReviewCard {
  id?: number;
  exerciseId: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: number;
  wrongCount: number;
  lastWrongAnswer: string;
  createdAt: number;
  lastReviewedAt: number;
}
