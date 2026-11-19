import type { PartyId } from '@pleey/domain/party';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

export class PartyIdentifier extends UuidV7IdentifierParser<PartyId> {
  constructor() {
    super('PartyId');
  }
}
