import { GuestIdentifier } from '../../application/identity/shared/services/identifiers/guest-identifier';
import { createGuestUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class GuestIdentifierMockFactory {
  create() {
    return createGuestUuidV7IdentifierMock(new GuestIdentifier());
  }
}
