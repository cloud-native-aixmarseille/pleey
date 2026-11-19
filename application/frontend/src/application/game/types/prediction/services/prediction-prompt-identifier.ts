import type { PredictionPromptId } from '@pleey/domain/game';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class PredictionPromptIdentifier extends UuidV7IdentifierParser<PredictionPromptId> {
  constructor() {
    super('PredictionPromptId');
  }
}
