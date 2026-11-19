import { type PlayableContentInput, QuizQuestionKind, type SelectableOptionInput } from '@pleey/domain/game';

export const PlayableImportItemKind = {
  MULTIPLE: QuizQuestionKind.Multiple,
  TRUE_FALSE: QuizQuestionKind.TrueFalse,
};
export type PlayableImportItemKind = (typeof PlayableImportItemKind)[keyof typeof PlayableImportItemKind];

export interface PlayableImportItemDefinition extends PlayableContentInput {
  readonly kind: PlayableImportItemKind;
  readonly options: readonly SelectableOptionInput[];
}

export enum PlayableImportFormat {
  CSV = 'csv',
  JSON = 'json',
  MARKDOWN = 'markdown',
  PLAINTEXT = 'plaintext',
}

export interface RawImportOption {
  readonly isCorrect: boolean;
  readonly text: string;
}

export interface RawImportItem {
  readonly kind?: PlayableImportItemKind;
  readonly options: readonly RawImportOption[];
  readonly points?: number;
  readonly text: string;
  readonly timeLimit?: number;
}

export type JsonItemRecord = {
  readonly answers?: readonly JsonOptionRecord[];
  readonly options?: readonly JsonOptionRecord[];
  readonly points?: number;
  readonly prompt?: string;
  readonly promptText?: string;
  readonly question?: string;
  readonly questionText?: string;
  readonly text?: string;
  readonly timeLimit?: number;
  readonly type?: string;
};

export type JsonOptionRecord =
  | string
  | {
      readonly answer?: string | null;
      readonly correct?: boolean;
      readonly isCorrect?: boolean;
      readonly label?: string | null;
      readonly text?: string | null;
    };

export const TRUE_FALSE_OPTION_TEXTS = ['True', 'False'] as const;
