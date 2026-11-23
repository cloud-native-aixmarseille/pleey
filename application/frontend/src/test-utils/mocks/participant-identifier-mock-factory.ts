import { ParticipantIdentifier } from '../../application/identity/shared/services/identifiers/participant-identifier';
import { createGuestUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class ParticipantIdentifierMockFactory {
  create() {
    return createGuestUuidV7IdentifierMock(new ParticipantIdentifier());
  }
}
