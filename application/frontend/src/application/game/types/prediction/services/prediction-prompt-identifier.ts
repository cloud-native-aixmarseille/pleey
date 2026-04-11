import type { PredictionPromptId } from '../../../../../domains/game/types/prediction/entities/prediction-prompt-id';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

export class PredictionPromptIdentifier extends NumericIdentifierParser<PredictionPromptId> {
  constructor() {
    super('PredictionPromptId');
  }
}
