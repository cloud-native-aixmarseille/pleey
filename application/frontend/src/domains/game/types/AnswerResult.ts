import type { AnswerStatistics } from "./AnswerStatistics";

export interface AnswerResult {
  isCorrect: boolean;
  points: number;
  correctAnswerIds: number[];
  statistics?: AnswerStatistics;
}
