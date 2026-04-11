import type { StageId } from '../../../../../../domains/game/party/shared/entities/party-stage';
import { NumericIdentifierParser } from '../../../../../shared/services/identifier-parser';

export class StageIdentifier extends NumericIdentifierParser<StageId> {
  constructor() {
    super('StageId');
  }
}
