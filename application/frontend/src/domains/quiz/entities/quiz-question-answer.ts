export interface QuizQuestionAnswer {
  readonly id: number | null;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}
