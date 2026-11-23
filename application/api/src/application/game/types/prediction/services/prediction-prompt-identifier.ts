import { Injectable } from '@nestjs/common';
import type { PredictionPromptId } from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class PredictionPromptIdentifier extends UuidV7IdentifierParser<PredictionPromptId> {
  constructor() {
    super('PredictionPromptId');
  }
}
