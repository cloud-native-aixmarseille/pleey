import type { PartyStageId } from '@pleey/domain/party';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

export class StageIdentifier extends UuidV7IdentifierParser<PartyStageId> {
  constructor() {
    super('StageId');
  }
}
