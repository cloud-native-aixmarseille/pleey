import type { PartyId } from '../../../../../../domains/game/party/shared/entities/party';
import { NumericIdentifierParser } from '../../../../../shared/services/identifier-parser';

export class PartyIdentifier extends NumericIdentifierParser<PartyId> {
  constructor() {
    super('PartyId');
  }
}
