import type { SelectableOption, SelectableOptionId } from '../../shared/entities/selectable-option';
import type { PredictionId } from './prediction';

export type PredictionPromptId = number & {
  readonly __identifierBrand: 'PredictionPromptId';
};

export type PredictionSelectableOptionId = SelectableOptionId<'PredictionSelectableOptionId'>;

export class PredictionPrompt {
  constructor(
    readonly id: PredictionPromptId,
    readonly predictionId: PredictionId,
    readonly position: number,
    readonly promptText: string,
    readonly timeLimit: number,
    readonly points: number,
    readonly options: readonly SelectableOption<PredictionSelectableOptionId>[],
  ) {}
}
