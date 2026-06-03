import type { PredictionPromptId } from '../../../../../domains/game/types/prediction/entities/prediction-prompt-id';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class PredictionPromptIdentifier extends UuidV7IdentifierParser<PredictionPromptId> {
  constructor() {
    super('PredictionPromptId');
  }
}
