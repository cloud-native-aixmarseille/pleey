import type { SelectableOptionInput } from '../../../../../../domain/game/types/shared/entities/selectable-option';

export enum PlayableImportItemKind {
  MULTIPLE = 'multiple',
  TRUE_FALSE = 'truefalse',
}

export interface PlayableImportItemDefinition {
  readonly kind: PlayableImportItemKind;
  readonly options: readonly SelectableOptionInput[];
  readonly points: number;
  readonly text: string;
  readonly timeLimit: number;
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

export const DEFAULT_POINTS = 1000;
export const DEFAULT_TIME_LIMIT = 20;
export const TRUE_FALSE_OPTION_TEXTS = ['True', 'False'] as const;
