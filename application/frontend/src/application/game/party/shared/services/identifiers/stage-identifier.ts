import type { StageId } from '../../../../../../domains/game/party/shared/entities/party-stage';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

export class StageIdentifier extends UuidV7IdentifierParser<StageId> {
  constructor() {
    super('StageId');
  }
}
