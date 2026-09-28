import type { SelectableOption, SelectableOptionId } from '../../shared/entities/selectable-option';
import type { QuizId } from './quiz';

export type QuizQuestionId = string & {
  readonly __identifierBrand: 'QuizQuestionId';
};

export type QuizSelectableOptionId = SelectableOptionId<'QuizSelectableOptionId'>;

export enum QuizQuestionType {
  Multiple = 'multiple',
  TrueFalse = 'truefalse',
}

export interface QuizQuestionMedia {
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
