import { PartyIdentifier } from '../../application/game/party/shared/services/identifiers/party-identifier';
import { createNumericUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class PartyIdentifierMockFactory {
  create() {
    return createNumericUuidV7IdentifierMock(new PartyIdentifier());
  }
}
