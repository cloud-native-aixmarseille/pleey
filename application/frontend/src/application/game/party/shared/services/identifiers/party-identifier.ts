import type { PartyId } from '../../../../../../domains/game/party/shared/entities/party';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

export class PartyIdentifier extends UuidV7IdentifierParser<PartyId> {
  constructor() {
    super('PartyId');
  }
}
