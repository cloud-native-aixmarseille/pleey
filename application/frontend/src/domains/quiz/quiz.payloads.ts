export type QuestionType = "multiple" | "truefalse";

export interface CreateQuestionPayload {
  quizId: number;
  position?: number;
  questionText: string;
  type: QuestionType;
  answers: Array<{
    id?: number;
    text?: string | null;
    position?: number;
    isCorrect?: boolean;
  }>;
  timeLimit?: number;
  points?: number;
}

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;

export interface UpdateQuizPayload {
  title?: string;
  description?: string | null;
}
