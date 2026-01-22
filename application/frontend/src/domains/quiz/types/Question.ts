import type { QuestionAnswer } from "./QuestionAnswer";

export interface Question {
  id: number;
  quizId: number;
  position: number;
  questionText: string;
  type: "multiple" | "truefalse";
  answers: QuestionAnswer[];
  timeLimit: number;
  points: number;
}
