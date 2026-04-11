import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';

export class UserIdentifierMockFactory {
  create() {
    return new UserIdentifier();
  }
}
