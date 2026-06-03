import type { PartyActionId } from '../../../../../../domains/game/party/shared/entities/party-action';
import { UuidV7IdentifierParser } from '../../../../../shared/services/identifier-parser';

export class PartyActionIdentifier extends UuidV7IdentifierParser<PartyActionId> {
  constructor() {
    super('PartyActionId');
  }
}
