import { Injectable } from '@nestjs/common';
import type { PredictionPromptId } from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class PredictionPromptIdentifier extends NumericIdentifierParser<PredictionPromptId> {
  constructor() {
    super('PredictionPromptId');
  }
}
