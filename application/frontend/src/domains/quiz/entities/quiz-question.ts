import type { QuizQuestionAnswer } from './quiz-question-answer';

export enum QuizQuestionType {
  MULTIPLE = 'multiple',
  TRUE_FALSE = 'trueFalse',
}

export interface QuizQuestion {
  readonly id: number;
  readonly quizId: number;
  readonly position: number;
  readonly questionText: string;
  readonly type: QuizQuestionType;
  readonly answers: readonly QuizQuestionAnswer[];
  readonly timeLimit: number;
  readonly points: number;
}
