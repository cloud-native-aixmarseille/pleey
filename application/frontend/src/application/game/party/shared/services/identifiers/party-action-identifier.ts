import type { PartyActionId } from '../../../../../../domains/game/party/shared/entities/party-action';
import { NumericIdentifierParser } from '../../../../../shared/services/identifier-parser';

export class PartyActionIdentifier extends NumericIdentifierParser<PartyActionId> {
  constructor() {
    super('PartyActionId');
  }
}
