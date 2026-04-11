import { Injectable } from '@nestjs/common';
import type { PredictionSelectableOptionId } from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class PredictionSelectableOptionIdentifier extends NumericIdentifierParser<PredictionSelectableOptionId> {
  constructor() {
    super('PredictionSelectableOptionId');
  }
}
