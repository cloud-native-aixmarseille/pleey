import {
  QuizQuestionKind,
  type SelectableOption,
  type QuizQuestionId as SharedQuizQuestionId,
  type QuizSelectableOptionId as SharedQuizSelectableOptionId,
} from '@pleey/domain/game';
import type { QuizId } from './quiz';

export type QuizQuestionId = SharedQuizQuestionId;
export type QuizSelectableOptionId = SharedQuizSelectableOptionId;
export const QuizQuestionType = QuizQuestionKind;
export type QuizQuestionType = (typeof QuizQuestionKind)[keyof typeof QuizQuestionKind];

export interface QuizQuestionMedia {
  readonly id: string;
  readonly mimeType: string;
  readonly uri: string;
}

export class QuizQuestion {
  constructor(
    readonly id: QuizQuestionId,
    readonly quizId: QuizId,
    readonly position: number,
    readonly questionText: string,
    readonly type: QuizQuestionType,
    readonly timeLimit: number,
    readonly points: number,
    readonly answers: readonly SelectableOption<QuizSelectableOptionId>[],
    readonly media: QuizQuestionMedia | null = null,
  ) {}
}
