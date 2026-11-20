import type { PartyActionId } from '@pleey/contracts/party';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

export class PartyActionIdentifier extends UuidV7IdentifierParser<PartyActionId> {
  constructor() {
    super('PartyActionId');
  }
}
