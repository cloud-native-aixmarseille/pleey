import { PartyActionIdentifier } from '../../application/game/party/shared/services/identifiers/party-action-identifier';
import { createNumericUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class PartyActionIdentifierMockFactory {
  create() {
    return createNumericUuidV7IdentifierMock(new PartyActionIdentifier());
  }
}
