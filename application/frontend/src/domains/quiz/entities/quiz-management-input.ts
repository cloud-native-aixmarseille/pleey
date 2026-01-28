import type { QuizQuestionType } from './quiz-question';

export interface UpdateQuizInput {
  readonly title?: string;
  readonly description?: string | null;
}

interface QuizQuestionAnswerInput {
  readonly id?: number;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}

export interface CreateQuizQuestionInput {
  readonly quizId: number;
  readonly position?: number;
  readonly questionText: string;
  readonly type: QuizQuestionType;
  readonly answers: readonly QuizQuestionAnswerInput[];
  readonly timeLimit: number;
  readonly points: number;
}

export interface UpdateQuizQuestionInput {
  readonly quizId?: number;
  readonly position?: number;
  readonly questionText?: string;
  readonly type?: QuizQuestionType;
  readonly answers?: readonly QuizQuestionAnswerInput[];
  readonly timeLimit?: number;
  readonly points?: number;
}
