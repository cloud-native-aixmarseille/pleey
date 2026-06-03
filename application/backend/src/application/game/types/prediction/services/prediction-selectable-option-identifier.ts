import { Injectable } from '@nestjs/common';
import type { PredictionSelectableOptionId } from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class PredictionSelectableOptionIdentifier extends UuidV7IdentifierParser<PredictionSelectableOptionId> {
  constructor() {
    super('PredictionSelectableOptionId');
  }
}
