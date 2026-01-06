import type { AnswerStatistics } from "./AnswerStatistics";

export interface AnswerResult {
  isCorrect: boolean;
  points: number;
  correctAnswer: string;
  statistics?: AnswerStatistics;
}
