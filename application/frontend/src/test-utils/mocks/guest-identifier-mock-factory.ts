import { GuestIdentifier } from '../../application/identity/shared/services/identifiers/guest-identifier';

export class GuestIdentifierMockFactory {
  create() {
    return new GuestIdentifier();
  }
}
